import {
  ConfigMap,
  LocalProgramArgs,
  LocalWorkspace,
  OpMap,
  PreviewResult,
  Stack,
  UpResult
} from '@pulumi/pulumi/automation';
import chalk from 'chalk';
import { Formatter } from './outputFormatter';
import { OutputMap, Unwrapped } from './stackModule';

export async function runPulumiProject<T extends object>({
  dir, project, stackName, operation, additionalConfig, formatter,
}: PulumiRunOptions): Promise<PulumiRunResult<T> | undefined> {
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

  let result: UpResult | PreviewResult;
  let status: string = 'succeeded';
  let outputs: OutputMap<Unwrapped<T>>;
  let summaryMessage: string | undefined;
  let operations: OpMap;
  switch (operation) {
    case 'preview':
      formatter('Previewing');

      const previewResult = await stack.preview({ onOutput: formatter });
      operations = previewResult.changeSummary;
      outputs = (await stack.outputs()) as OutputMap<Unwrapped<T>>;
      break;
    case 'up':
      formatter('Deploying');

      const upResult = await stack.up({ onOutput: formatter });
      operations = upResult.summary.resourceChanges;
      status = upResult.summary.result;
      summaryMessage = upResult.summary.message;
      outputs = upResult.outputs as OutputMap<Unwrapped<T>>;
      break;
    case 'destroy':
      formatter('Destroying');

      const destroyResult = await stack.destroy({ onOutput: formatter });
      operations = destroyResult.summary.resourceChanges;
      status = destroyResult.summary.result;
      summaryMessage = destroyResult.summary.message;
      break;
  }

  if (status !== 'succeeded') {
    formatter(result.stderr);
    formatter(summaryMessage);
    throw new Error();
  }

  if (operations) {
    formatter('Succeeded! Resource summary:');
    const fmtNum = (num?: number) => `${num}`.padStart(3);
    if (operations?.create) {
      formatter(`${fmtNum(operations?.create)} ${chalk.green('created')}`);
    }
    if (operations?.replace) {
      formatter(`${fmtNum(operations?.replace)} ${chalk.magenta('replaced')}`);
    }
    if (operations?.update) {
      formatter(`${fmtNum(operations?.update)} ${chalk.yellow('updated')}`);
    }
    if (operations?.same) {
      formatter(`${fmtNum(operations?.same)} ${chalk.bold('unchanged')}`);
    }
  }

  return {
    stack,
    projectName: project,
    outputs: outputs as OutputMap<Unwrapped<T>>,
  };
}
interface PulumiRunOptions {
  dir: string;
  project: string;
  stackName: string;
  operation: 'up' | 'preview' | 'destroy';
  additionalConfig: ConfigMap;
  formatter: Formatter;
}
interface PulumiRunResult<T> {
  stack: Stack;
  projectName: string;
  outputs: OutputMap<Unwrapped<T>>;
}
