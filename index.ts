
import { chooseColor, outputFormatter } from './outputFormatter';
import { runPulumiProject } from './runPulumiProject';

interface ClusterOutputs {
  shinyName: string;
  shinyConfig: string;
}

async function main() {
  const clusters = [
    { name: 'kind-local', cloud: 'kind', nodePort: 32001 },
  ];

  await Promise.allSettled(
    clusters.map(async (clusterDefinition) => {
      let theme = chooseColor();

      const serviceType = clusterDefinition.nodePort ? 'NodePort' : 'LoadBalancer';
      const serviceNodePort = `${clusterDefinition.nodePort ?? 0}`;
      const cluster = await runPulumiProject<ClusterOutputs>({
        dir: './shinycluster',
        project: 'shinycluster',
        stackName: clusterDefinition.name,
        operation: 'up',
        additionalConfig: {
          cloud: { value: clusterDefinition.cloud },
          nodePort: { value: serviceNodePort },
        },
        formatter: outputFormatter(`cluster   ${clusterDefinition.name}`, theme)
      });

      runPulumiProject({
        dir: './shinyapp',
        project: 'shinyapp',
        stackName: clusterDefinition.name,
        operation: 'up',
        additionalConfig: {
          kubeconfig: cluster.outputs.shinyConfig,
          serviceType: { value: serviceType },
          serviceNodePort: { value: serviceNodePort },
        },
        formatter: outputFormatter(`app       ${clusterDefinition.name}`, theme)
      });
    }),
  );
}

main();
