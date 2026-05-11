# Part 08 — Deployment Architecture

## 1. Environments

| Env | Mục đích | Tài nguyên | Data |
|---|---|---|---|
| **dev** | Local + sandbox cho developer | Docker compose | Synthetic |
| **staging** | UAT, demo, training | k8s, ~50% prod size | Anonymized prod copy refresh weekly |
| **production** | Live | k8s, full HA | Real |
| **sandbox** | Tenant test integration | Subset prod k8s, separate API key | Sandbox data only |
| **DR** | Disaster recovery | Different region, hot standby | Continuous replication |

## 2. Reference deployment topology

```
                              ┌─────────────────┐
                              │      DNS        │
                              │ loyalty.reborn.vn│
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  CDN (CloudFlare│
                              │  /BunnyCDN)     │
                              │  + WAF          │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  Load Balancer  │
                              │  (cloud LB / HA │
                              │   proxy)        │
                              └────────┬────────┘
                                       │
                       ┌───────────────┼───────────────┐
                       ▼               ▼               ▼
                  ┌─────────┐    ┌─────────┐    ┌─────────┐
                  │ Ingress │    │ Ingress │    │ Ingress │
                  │ AZ-1    │    │ AZ-2    │    │ AZ-3    │
                  └────┬────┘    └────┬────┘    └────┬────┘
                       │              │              │
                  ┌────▼──────────────▼──────────────▼────┐
                  │  Kubernetes Cluster (multi-AZ)         │
                  │                                        │
                  │  Application namespace:                │
                  │  ┌─────────────────────────────────┐   │
                  │  │ market-svc (HPA 3-20 pods)      │   │
                  │  │ customer-svc (HPA 2-10)         │   │
                  │  │ care-svc (HPA 2-8)              │   │
                  │  │ notification-svc (HPA 3-15)     │   │
                  │  │ analytics-svc (HPA 2-6)         │   │
                  │  │ auth-svc (HPA 2-6)              │   │
                  │  │ admin-frontend (static, 2 pod)  │   │
                  │  └─────────────────────────────────┘   │
                  │                                        │
                  │  Stateful namespace (dedicated nodes): │
                  │  ┌─────────────────────────────────┐   │
                  │  │ PostgreSQL primary + 2 replica  │   │
                  │  │ Redis Cluster 3M+3R             │   │
                  │  │ RabbitMQ 3 nodes mirrored       │   │
                  │  │ Elasticsearch 3 nodes           │   │
                  │  │ ClickHouse 2 shard × 2 replica  │   │
                  │  └─────────────────────────────────┘   │
                  └────────────────────────────────────────┘
                                       │
                              ┌────────▼────────┐
                              │ S3-compat storage│
                              │ (managed/MinIO)  │
                              └─────────────────┘
                                       │
                              ┌────────▼────────┐
                              │ Egress to:      │
                              │ - SMS Gateway   │
                              │ - Zalo OA API   │
                              │ - Email (SES)   │
                              │ - SSO Reborn    │
                              └─────────────────┘
```

## 3. Hosting options (offer to customer)

| Option | Mô tả | Pros | Cons |
|---|---|---|---|
| **Cloud (đề xuất)** | Reborn host trên cloud VN (FPT, Viettel, VNG) | Nhanh deploy, auto-scale, không lo hardware | Cost OPEX, data ở cloud provider VN |
| **On-premise** | Deploy trên server khách | Data 100% nội bộ, compliance dễ | Khách lo hardware, upgrade chậm |
| **Hybrid** | App trên cloud, DB on-prem | Cân bằng | Phức tạp network, latency cross-site |

Quyết định: tham vấn Phòng CNTT&CĐS khách sau khi xác nhận yêu cầu compliance + budget.

## 4. CI/CD Pipeline

```
Developer push to branch
       ▼
  GitHub/GitLab
       ▼
  ┌─────────────────────┐
  │ CI (PR validation)  │
  │  - Lint             │
  │  - Unit tests       │
  │  - SAST (Semgrep)   │
  │  - SCA (Dependabot) │
  │  - Build artifacts  │
  └──────────┬──────────┘
             │ ✅
             ▼
  Code review approved
             │
             ▼
  Merge to main
       ▼
  ┌─────────────────────┐
  │ CD pipeline         │
  │  - Build Docker     │
  │  - Push to registry │
  │  - Deploy staging   │
  │  - Smoke tests      │
  │  - Approval gate    │
  │  - Deploy prod      │
  │    (blue-green)     │
  │  - Canary 10%       │
  │  - Full rollout     │
  └──────────┬──────────┘
             ▼
  Production
```

**Deployment strategy:** Blue-green hoặc canary (10% → 50% → 100% với gap 30 phút monitor).

**Rollback:** Auto rollback nếu error rate > 5% trong 5 phút sau deploy.

## 5. Scaling strategy

### 5.1. Horizontal Pod Autoscaler (HPA)

```yaml
# market-service HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: market-service
spec:
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: { type: Utilization, averageUtilization: 70 }
  - type: Resource
    resource:
      name: memory
      target: { type: Utilization, averageUtilization: 80 }
  - type: Pods
    pods:
      metric: { name: http_requests_per_second }
      target: { type: AverageValue, averageValue: 100 }
```

### 5.2. Database scaling

- Năm 1: single PG primary 16 vCPU/64GB + 2 read replicas → đủ cho 3M KH
- Năm 2+: nếu write QPS > 1K, scale write: sharding theo `tenant_id` (chỉ áp dụng nếu multi-tenant nhiều)
- Hoặc upgrade primary lên 32 vCPU/128GB (vertical scale)

### 5.3. Cache & queue

- Redis: scale by adding shards (cluster mode)
- RabbitMQ: scale by adding nodes + balance queues

### 5.4. Pre-event scale-up

Trước Black Friday / Tết:
- Cron schedule HPA min replicas → tăng 1.5×
- Pre-warm cache for hot members (top 100K)
- Increase RabbitMQ queue capacity
- Notify ops team

## 6. Disaster Recovery (DR)

| Scenario | RTO | RPO | Procedure |
|---|---|---|---|
| **App pod crash** | < 1 min | 0 | k8s auto-restart |
| **Node crash** | < 5 min | 0 | k8s reschedule pod to another node |
| **AZ outage** | < 15 min | < 1 min | LB removes failed AZ, replica promotion |
| **DB primary fail** | < 5 min | < 1s | Promote sync replica (Patroni/Stolon) |
| **Region outage** | < 4 hours | < 1 hour | DR region failover, DNS switch |
| **Data corruption** | < 4 hours | up to 1 hour | Restore from snapshot |
| **Ransomware** | < 24 hours | up to 24 hours | Restore from offline backup |

**DR drill** quarterly: simulate region failure, measure RTO/RPO actual.

## 7. Observability stack

| Layer | Tool | Metrics |
|---|---|---|
| Metrics | Prometheus + Grafana | RED method: Rate, Errors, Duration |
| Logs | Loki / ELK | Structured JSON, trace_id correlation |
| Traces | Jaeger / Tempo (OpenTelemetry) | End-to-end request flow |
| Alerts | Alertmanager → PagerDuty / Slack | Golden signals threshold |
| Uptime | Pingdom / UptimeRobot external | Public endpoints |
| APM | (Optional) Datadog / New Relic | Application performance |

**Key dashboards:**
- API Gateway: requests, errors, latency per endpoint
- Service health: pod count, restarts, OOM
- DB: connections, slow queries, replication lag
- Queue: backlog, consumer lag, DLQ size
- Business: orders/min, points earned/min, errors/min

## 8. Environment promotion

```
dev (developer laptop) ──► staging (UAT)  ──► sandbox  ──► production
                                │                              │
                                └─ refreshed weekly             └─ released bi-weekly
                                   from anonymized prod
```

Promotion gates:
- staging → sandbox: smoke tests passed, manager approval
- sandbox → prod: UAT signed off, deploy window, rollback plan ready

## 9. Operations runbook

Chi tiết operations procedure: [`../08-operations/operations-runbook.md`](../08-operations/operations-runbook.md)
- Deploy procedure
- Rollback procedure
- Incident response
- DB failover drill
- Common troubleshooting

## 10. Tham chiếu

- Scalability sizing: [`part-07-scalability-3m-customers.md`](part-07-scalability-3m-customers.md)
- Microservices view: [`part-04-microservices.md`](part-04-microservices.md)
- Operations: [`../08-operations/`](../08-operations/)
- Deployment guide: [`../08-operations/deployment-guide.md`](../08-operations/deployment-guide.md)
