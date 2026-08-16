# DevOpsWithKubernetes

## Exercises

### Chapter 2

- [1.1](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.1/LogOutput)
- [1.2](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.2/TheProject)
- [1.3](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.3/LogOutput)
- [1.4](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.4/TheProject)
- [1.5](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.5/TheProject)
- [1.6](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.6/TheProject)
- [1.7](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.7/LogOutput)
- [1.8](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.8/TheProject)
- [1.9](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.9/PingPong)
- [1.10](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.10/LogOutput)
- [1.11](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.11/manifests)
- [1.12](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.12/TheProject)
- [1.13](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/1.13/TheProject)

### Chapter 3

- [2.1](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.1/LogOutput)
- [2.2](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.2/TheProject)
- [2.3](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.3/Logger)
- [2.4](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.4/TheProject)
- [2.5](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.5/Logger)
- [2.6](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.6/TheProject)
- [2.7](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.7/Logger)
- [2.8](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.8/TheProject)
- [2.9](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.9/TheProject)
- [2.10](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/2.10/TheProject)

### Chapter 4
- [3.1](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.1/Logger)
- [3.2](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.2/Logger)
- [3.3](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.3/Logger)
- [3.4](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.4/Logger)
- [3.5](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.5/TheProject)
- [3.6](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.6/.github/workflows)
- [3.7](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.7/.github/workflows)
- [3.8](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.8/.github/workflows)
### Managed vs Self-hosted DBs
When considering managed vs self-hosted databases, several things should be taken into consideration. The right solution is nuanced and depends on the use case, organization priorities, team capability and regulatory requirements.

#### Managed
- Pros
  - Ease of management - you deploy it and it's there. The provider will usually take care of upgrades, backups etc. maintenance tasks, eliminating the need for additional infra resources from the development team's POV.
- Cons
  - Cost - managed solutions have to include the running costs of management as well as a healthy margin in the charged fee. At a certain scale, the cost of running your own infra may become more cost-effective.
  - Regulatory requirements - in some environments, there may be regulatory requirements that require more control than many managed solutions can provide.

#### Self-hosted
- Pros
  - Full control - you are in charge of what gets deployed, how it is configured. Valuable in environments with regulatory constraints and specialized technical needs.
  - Cost at scale - although managed solutions are quite affordable even at moderately large scale, at a certain point running your own infra does become more cost-effective, benefiting from economies of scale.
- Cons
  - Full control - while you are able to customize the DBMS to your specific needs, you are also responsible for backups, upgrades and other maintenance tasks.
  - Barrier to entry - managing your own database means that you will need to allocate resources to doing so, which can be a hard sell for resource-constrained organizations, for example startups.
- [3.10](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.10/.github/workflows)
- [3.11](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/3.11/TheProject)
- 3.12:
<img width="1038" height="362" alt="Screenshot 2026-08-08 at 15 18 07" src="https://github.com/user-attachments/assets/589dcdd6-8893-43ee-83e1-2ca2472610f9" />

### Chapter 5
- [4.1](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/4.1/Logger)
- [4.2](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/4.2/TheProject)
- 4.3: sum(kube_pod_info{created_by_kind="StatefulSet", namespace="monitoring"})
- [4.4](https://github.com/eetujukka1/DevOpsWithKubernetes/tree/4.4/Logger)
