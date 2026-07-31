export interface MigrateProjectOptions {
  source?: string;
  dryRun?: boolean;
  force?: boolean;
  clean?: boolean;
  map?: boolean;
}

export interface MigrationPlan {
  imageRatios: Record<string, unknown>;
  properties: Record<string, unknown>;
  components: Array<{
    name: string;
    group: string;
    order: string;
    targetFolder: string;
    html: string;
    htmlFileName: string;
    ldConf: Record<string, unknown>;
    source: string | null;
    scss: Array<{
      source: string;
      targetName: string;
    }>;
  }>;
  scss: Array<{
    source: string;
    target: string;
  }>;
}

export function migrateProject(
  options?: MigrateProjectOptions,
): Promise<MigrationPlan>;
export default migrateProject;
