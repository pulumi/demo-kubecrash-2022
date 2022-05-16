import * as pulumi from "@pulumi/pulumi";
import * as civo from "@pulumi/civo";
import * as linode from "@pulumi/linode";
import * as kind from "@pulumi/kind";
import {Output} from "@pulumi/pulumi";


// Try out a component

export class ShinyCluster extends pulumi.ComponentResource {
    constructor(name: string, args: {
        cloud: "linode" | "civo" | "kind"
    }, opts: {}) {
        super("pkg:index:ShinyCluster", name, {}, opts);
        switch (args.cloud) {
            case 'linode':
                const linodeCluster = new linode.LkeCluster("my-cluster", {
                    k8sVersion: "1.22",
                    label: "guin",
                    pools: [{
                        count: 2,
                        type: "g6-standard-2",
                    }],
                    region: "us-central",
                    tags: ["guin"],
                }, {parent: this});
                this.name = linodeCluster.label;
                this.kubeConfig = linodeCluster.kubeconfig
                break
            case 'civo':
                const fw = new civo.Firewall("guin-fw", {
                        region: "nyc1",
                        createDefaultRules: true,
                    }, {parent: this}
                );

                const civoCluster = new civo.KubernetesCluster("guin-civo", {
                    name: "guin",
                    region: "nyc1",
                    firewallId: fw.id,
                    pools: {
                        nodeCount: 3,
                        size: "g4s.kube.xsmall",
                    }
                }, {parent: this});
                this.name = civoCluster.name;
                this.kubeConfig =  civoCluster.kubeconfig;
                break
            case 'kind':
                const kindCluster = new kind.cluster.Cluster("guin-kind", {
                    nodes: [
                        {
                            role: kind.node.RoleType.ControlPlane,
                            extraPortMappings: [{
                                containerPort: 32525,
                                hostPort: 32525,
                            }],
                        },
                        {
                            role: kind.node.RoleType.Worker
                        }
                    ]
                }, {parent: this})
                this.name =  kindCluster.name;
                this.kubeConfig = kindCluster.kubeconfig;

        }

    }
    name: Output<string>
    kubeConfig: Output<string>
}

const config = new pulumi.Config()

const shinyCluster = new ShinyCluster("guin", {cloud: config.require("cloud")}, {})

export const shinyName = shinyCluster.name;
export const shinyConfig = pulumi.secret(shinyCluster.kubeConfig);
