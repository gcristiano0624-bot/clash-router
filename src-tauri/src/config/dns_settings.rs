use crate::{constants, utils::dirs};
use anyhow::{Result, anyhow};
use serde_yaml_ng::{Mapping, Value};
use tokio::fs;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NormalizedDnsConfig {
    pub dns: Option<Mapping>,
    pub hosts: Option<Mapping>,
    pub warnings: Vec<String>,
}

pub async fn load_dns_config() -> Result<NormalizedDnsConfig> {
    let dns_path = dirs::app_home_dir()?.join(constants::files::DNS_CONFIG);
    let dns_yaml = fs::read_to_string(&dns_path).await?;
    let dns_config = serde_yaml_ng::from_str::<Mapping>(&dns_yaml)?;
    normalize_dns_config(dns_config)
}

pub fn normalize_dns_config(mut dns_config: Mapping) -> Result<NormalizedDnsConfig> {
    let mut warnings = Vec::new();

    let hosts = match dns_config.remove("hosts") {
        Some(Value::Mapping(hosts)) => Some(hosts),
        Some(_) => return Err(anyhow!("DNS config field `hosts` must be a mapping")),
        None => None,
    };

    let dns = match dns_config.remove("dns") {
        Some(Value::Mapping(dns)) => sanitize_dns_mapping(dns, &mut warnings),
        Some(_) => return Err(anyhow!("DNS config field `dns` must be a mapping")),
        None => sanitize_dns_mapping(dns_config, &mut warnings),
    };

    Ok(NormalizedDnsConfig {
        dns: Some(dns),
        hosts,
        warnings,
    })
}

pub fn apply_dns_config(config: &mut Mapping, dns_config: &NormalizedDnsConfig) {
    if let Some(hosts) = &dns_config.hosts {
        config.insert("hosts".into(), Value::Mapping(hosts.clone()));
    }

    if let Some(dns) = &dns_config.dns {
        config.insert("dns".into(), Value::Mapping(dns.clone()));
    }
}

fn sanitize_dns_mapping(mut dns: Mapping, warnings: &mut Vec<String>) -> Mapping {
    if dns.remove("use-system-hosts").is_some() {
        warnings.push("Ignored unsupported DNS field `use-system-hosts`".into());
    }

    dns
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_top_level_dns_and_hosts() {
        let config = Mapping::from_iter([
            ("dns".into(), Value::Mapping(Mapping::from_iter([("enable".into(), true.into())]))),
            ("hosts".into(), Value::Mapping(Mapping::from_iter([("localhost".into(), "127.0.0.1".into())]))),
        ]);

        let normalized = normalize_dns_config(config).expect("normalization should succeed");

        assert_eq!(
            normalized.dns,
            Some(Mapping::from_iter([("enable".into(), true.into())]))
        );
        assert_eq!(
            normalized.hosts,
            Some(Mapping::from_iter([("localhost".into(), "127.0.0.1".into())]))
        );
        assert!(normalized.warnings.is_empty());
    }

    #[test]
    fn normalizes_root_level_dns_mapping() {
        let config = Mapping::from_iter([
            ("enable".into(), true.into()),
            ("nameserver".into(), Value::Sequence(vec!["1.1.1.1".into()])),
        ]);

        let normalized = normalize_dns_config(config).expect("normalization should succeed");

        assert_eq!(
            normalized.dns,
            Some(Mapping::from_iter([
                ("enable".into(), true.into()),
                ("nameserver".into(), Value::Sequence(vec!["1.1.1.1".into()])),
            ]))
        );
        assert_eq!(normalized.hosts, None);
    }

    #[test]
    fn strips_use_system_hosts_with_warning() {
        let config = Mapping::from_iter([(
            "dns".into(),
            Value::Mapping(Mapping::from_iter([
                ("enable".into(), true.into()),
                ("use-system-hosts".into(), false.into()),
            ])),
        )]);

        let normalized = normalize_dns_config(config).expect("normalization should succeed");

        assert_eq!(
            normalized.dns,
            Some(Mapping::from_iter([("enable".into(), true.into())]))
        );
        assert_eq!(
            normalized.warnings,
            vec!["Ignored unsupported DNS field `use-system-hosts`".to_string()]
        );
    }

    #[test]
    fn rejects_non_mapping_hosts() {
        let config = Mapping::from_iter([
            ("dns".into(), Value::Mapping(Mapping::new())),
            ("hosts".into(), Value::String("localhost".into())),
        ]);

        let err = normalize_dns_config(config).expect_err("normalization should fail");

        assert!(err.to_string().contains("`hosts` must be a mapping"));
    }

    #[test]
    fn injects_dns_and_hosts_into_top_level() {
        let mut config = Mapping::new();
        let normalized = NormalizedDnsConfig {
            dns: Some(Mapping::from_iter([("enable".into(), true.into())])),
            hosts: Some(Mapping::from_iter([("localhost".into(), "127.0.0.1".into())])),
            warnings: Vec::new(),
        };

        apply_dns_config(&mut config, &normalized);

        assert_eq!(
            config.get("dns"),
            Some(&Value::Mapping(Mapping::from_iter([("enable".into(), true.into())])))
        );
        assert_eq!(
            config.get("hosts"),
            Some(&Value::Mapping(Mapping::from_iter([("localhost".into(), "127.0.0.1".into())])))
        );
    }
}
