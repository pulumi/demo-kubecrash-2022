
import { chooseColor, outputFormatter } from './outputFormatter';
import { runPulumiProject } from './runPulumiProject';

interface ClusterOutputs {
  shinyName: string;
  shinyConfig: string;
}

async function main() {

  // const clusters = [
  //   { name: 'kind-local', cloud: 'kind', nodePort: 32001 },
  //   { name: 'kind-local-2', cloud: 'kind', nodePort: 32002 },
  //   { name: 'linode-1', cloud: 'linode' },
  //   { name: 'linode-2', cloud: 'linode' },
  //   { name: 'civo-1', cloud: 'civo' },
  //   { name: 'civo-2', cloud: 'civo' },
  // ];
  // await Promise.allSettled(
  //   clusters.map(async (clusterDefinition) => {
  //     let theme = chooseColor();

  //     const serviceType = clusterDefinition.nodePort ? 'NodePort' : 'LoadBalancer';
  //     const serviceNodePort = `${clusterDefinition.nodePort ?? 0}`;
  //     const cluster = await runPulumiProject<ClusterOutputs>({
  //       dir: './shinycluster',
  //       project: 'shinycluster',
  //       stackName: clusterDefinition.name,
  //       operation: 'up',
  //       additionalConfig: {
  //         cloud: { value: clusterDefinition.cloud },
  //         nodePort: { value: serviceNodePort },
  //       },
  //       formatter: outputFormatter(`cluster   ${clusterDefinition.name}`, theme)
  //     });

  //     runPulumiProject({
  //       dir: './shinyapp',
  //       project: 'shinyapp',
  //       stackName: cluster.stack.name,
  //       operation: 'up',
  //       additionalConfig: {
  //         kubeconfig: cluster.outputs.shinyConfig,
  //         serviceType: { value: serviceType },
  //         serviceNodePort: { value: serviceNodePort },
  //       },
  //       formatter: outputFormatter(`app       ${clusterDefinition.name}`, theme)
  //     });
  //   }),
  // );


  const formerClusters = [
    { name: 'kind-local', cloud: 'kind', nodePort: 32001 },
    { name: 'kind-local-2', cloud: 'kind', nodePort: 32002 },
    { name: 'linode-1', cloud: 'linode' },
    { name: 'linode-2', cloud: 'linode' },
    { name: 'civo-1', cloud: 'civo' },
    { name: 'civo-2', cloud: 'civo' },
  ];


  await Promise.allSettled(
    formerClusters.map(async (clusterDefinition) => {
      let theme = chooseColor();

      const serviceType = clusterDefinition.nodePort ? 'NodePort' : 'LoadBalancer';
      const serviceNodePort = `${clusterDefinition.nodePort ?? 0}`;
      await runPulumiProject<ClusterOutputs>({
        dir: './shinycluster',
        project: 'shinycluster',
        stackName: clusterDefinition.name,
        operation: 'destroy',
        additionalConfig: {
          cloud: { value: clusterDefinition.cloud },
          nodePort: { value: serviceNodePort },
        },
        formatter: outputFormatter(`cluster   ${clusterDefinition.name}`, theme)
      });
    }),
  );
}

main();
