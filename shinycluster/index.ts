import * as pulumi from '@pulumi/pulumi';
import * as civo from '@pulumi/civo';
import * as linode from '@pulumi/linode';
import * as kind from '@pulumi/kind';
import { Output } from '@pulumi/pulumi';
import * as random from '@pulumi/random';

// Try out a component

export class ShinyCluster extends pulumi.ComponentResource {
  constructor(
    name: string,
    args: {
      cloud: 'linode' | 'civo' | 'kind';
      nodePort?: number;
    },
    opts: {},
  ) {
    super('pkg:index:ShinyCluster', name, {}, opts);

    const suffix = new random.RandomId('name', {
      byteLength: 8,
    }, {parent: this}).hex;

    switch (args.cloud) {
      case 'linode':
        const linodeCluster = new linode.LkeCluster(
          'my-cluster',
          {
            label: pulumi.interpolate`guin-${suffix}`,
            k8sVersion: '1.22',
            pools: [
              {
                count: 2,
                type: 'g6-standard-2',
              },
            ],
            region: 'us-central',
            tags: ['guin'],
          },
          { parent: this },
        );
        this.name = linodeCluster.label;
        this.kubeConfig = linodeCluster.kubeconfig.apply((x) =>
          Buffer.from(x, 'base64').toString(),
        );
        break;
      case 'civo':
        const fw = new civo.Firewall(
          'guin-fw',
          {
            name: pulumi.interpolate`guin-fw-${suffix}`,
            region: 'nyc1',
            createDefaultRules: true,
          },
          { parent: this },
        );

        const civoCluster = new civo.KubernetesCluster(
          'guin-civo',
          {
            region: 'nyc1',
            name: pulumi.interpolate`guin-${suffix}`,
            firewallId: fw.id,
            pools: {
              nodeCount: 3,
              size: 'g4s.kube.xsmall',
            },
          },
          { parent: this },
        );
        this.name = civoCluster.name;
        this.kubeConfig = civoCluster.kubeconfig;
        break;
      case 'kind':
        const kindCluster = new kind.cluster.Cluster(
          'guin-kind',
          {
            name: pulumi.interpolate`guin-${suffix}`,
            nodes: [
              {
                role: kind.node.RoleType.ControlPlane,
                extraPortMappings: [
                  {
                    containerPort: args.nodePort,
                    hostPort: args.nodePort,
                  },
                ],
              },
              {
                role: kind.node.RoleType.Worker,
              },
            ],
          },
          { parent: this },
        );
        this.name = kindCluster.name;
        this.kubeConfig = kindCluster.kubeconfig;
    }
  }
  name: Output<string>;
  kubeConfig: Output<string>;
}

const config = new pulumi.Config();

const shinyCluster = new ShinyCluster(
  'guin',
  {
    cloud: config.require('cloud'),
    nodePort: config.getNumber('nodePort'),
  },
  {},
);

export const shinyName = shinyCluster.name;
export const shinyConfig = pulumi.secret(shinyCluster.kubeConfig);
