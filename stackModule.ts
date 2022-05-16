import * as pulumi from '@pulumi/pulumi';

export type Unwrapped<T> = NonNullable<pulumi.Unwrap<Awaited<T>>>;

export type OutputMap<T> = {
  [K in keyof T]: {
    value: T[K];
    secret: boolean;
  };
};

export type StackModule<T> = {
  workDir: string;
  projectName: string;
  stack(): Promise<T>;
};

type StackOutputs<T> = T extends StackModule<infer O> ? O : never;

/**
 * The type of the outputs, as returned by the automation API as an "OutputMap".
 */
export type StackOutputMap<T> = OutputMap<Unwrapped<StackOutputs<T>>>;

/**
 * The type of the outputs, as if executed and run in a Pulumi program:
 */
export type StackOutputValues<T> = Unwrapped<StackOutputs<T>>;

/**
 * The type of a function that gets values by name from the outputs of a stack.
 *
 * See `stackOutputConfig`.
 */
export type StackOutputGetter<T> = <
  K extends keyof StackOutputValues<T> & string,
>(
  key: K,
) => StackOutputValues<T>[K];
