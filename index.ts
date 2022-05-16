import {
  ConfigMap,
  LocalProgramArgs,
  LocalWorkspace,
  Stack,
} from '@pulumi/pulumi/automation';
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';

import { outputFormatter } from './outputFormatter';
import {
  OutputMap,
  StackModule,
  StackOutputMap,
  Unwrapped,
} from './stackModule';

const STACK_NAME = process.env.STACK_NAME ?? 'dev';
const DRY_RUN = process.env.DRY_RUN === 'false' ? false : true;

interface StackUpResult<T> {
  stack: Stack;
  projectName: string;
  outputs: OutputMap<Unwrapped<T>>;
}

export async function stackUp<T extends object>(
  dir: string,
  project: string,
  stackName: string,
  dryrun = false,
  additionalConfig: ConfigMap,
): Promise<StackUpResult<T>> {
  const formatter = outputFormatter(`${project}/${stackName}`);

  const localProgramArgs: LocalProgramArgs = {
    stackName,
    workDir: dir,
  };
  const stack = await LocalWorkspace.createOrSelectStack(localProgramArgs, {});
  formatter(`Spinning up stack ${project}/${stackName}`);
  await stack.setAllConfig({
    ...additionalConfig,
  });

  formatter('Refreshing');
  await stack.refresh();

  if (dryrun) {
    const outputs = (await stack.outputs()) as OutputMap<Unwrapped<T>>;
    return {
      stack,
      projectName: project,
      outputs,
    };
  }
  formatter('Deploying');
  const result = await stack.up();

  if (result.summary.result !== 'succeeded') {
    formatter(result.stdout);
    formatter(result.stderr);
    throw new Error(result.summary.message);
  }

  formatter('Succeeded! Resource summary:');
  const fmtNum = (num?: number) => `${num}`.padStart(3);
  const changes = result.summary.resourceChanges;
  if (changes?.create) {
    formatter(`${fmtNum(changes?.create)} ${chalk.green('created')}`);
  }
  if (changes?.replace) {
    formatter(`${fmtNum(changes?.replace)} ${chalk.magenta('replaced')}`);
  }
  if (changes?.update) {
    formatter(`${fmtNum(changes?.update)} ${chalk.yellow('updated')}`);
  }
  if (changes?.same) {
    formatter(`${fmtNum(changes?.same)} ${chalk.bold('unchanged')}`);
  }

  return {
    stack,
    projectName: project,
    outputs: result.outputs as OutputMap<Unwrapped<T>>,
  };
}

export async function stackPreview<T>(
  dir: string,
  project: string,
  stackName: string = STACK_NAME,
  additionalConfig: ConfigMap,
) {
  const stack = await LocalWorkspace.createOrSelectStack({
    stackName,
    workDir: dir,
  });

  await stack.getAllConfig();
  const stackConfig = await stack.setAllConfig(additionalConfig);
  const formatter = outputFormatter(`${project}/${stackName}`);
  await stack.preview({ onOutput: formatter });

  return {
    stack,
    projectName: project,
    outputs: (await stack.outputs()) as OutputMap<Unwrapped<T>>,
  };
}

interface ClusterOutputs {
  shinyName: string,
  shinyConfig: string,
};

async function main() {
  // const sharedProject = await LocalWorkspace.createOrSelectStack({
  //   stackName: STACK_NAME,
  //   workDir: ".",
  // });

  const clusters = await Promise.all([
    stackUp<ClusterOutputs>('./shinycluster', 'shinycluster', 'kind', false, {
      "cloud": { value: "kind" },
    }),
    // stackPreview('./shinycluster', 'kind', 'bravo', {
    //   "cloud": { value: "kind" },
    // }),
  ]);

  for (const cluster of clusters) {
    stackUp("./shinyapp", 'shinyapp', cluster.stack.name, false, {
      "kubeconfig": cluster.outputs.shinyConfig,
      "serviceType": { value: "NodePort" },
    })
  }
}

main();
