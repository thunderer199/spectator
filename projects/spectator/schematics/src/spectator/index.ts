import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { ComponentOptions, DirectiveOptions, ServiceOptions } from './schema';
import { experimental, normalize, strings } from '@angular-devkit/core';
import { getWorkspace } from '@schematics/angular/utility/config';
export function spectatorComponentSchematic(options: ComponentOptions): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'component', {
      ...options,
      skipTests: true,
      spec: false
    }),
    (tree: Tree, _context: SchematicContext): Rule => {
      _ensurePath(tree, options);
      const movePath = normalize(options.path + '/' + strings.dasherize(options.name) || '');
      const specTemplateRule = apply(url(`./files/${options.withHost ? 'component-host' : options.withCustomHost ? 'component-custom-host' : 'component'}`), [
        template({
          ...strings,
          ...options
        }),
        move(movePath)
      ]);
      return mergeWith(specTemplateRule, MergeStrategy.Default);
    }
  ]);
}

export function spectatorServiceSchematic(options: ServiceOptions): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'service', {
      ...options,
      skipTests: true,
      spec: false
    }),
    (tree: Tree, _context: SchematicContext): Rule => {
      _ensurePath(tree, options);
      const movePath = normalize(options.path || '');
      const specTemplateRule = apply(url(`./files/${options.isDataService ? 'data-service' : `service`}`), [
        template({
          ...strings,
          ...options
        }),
        move(movePath)
      ]);
      return mergeWith(specTemplateRule, MergeStrategy.Default);
    }
  ]);
}

export function spectatorDirectiveSchematic(options: DirectiveOptions): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'directive', {
      ...options,
      skipTests: true,
      spec: false
    }),
    (tree: Tree, _context: SchematicContext): Rule => {
      _ensurePath(tree, options);
      const movePath = normalize(options.path || '');
      const specTemplateRule = apply(url(`./files/directive`), [
        template({
          ...strings,
          ...options
        }),
        move(movePath)
      ]);
      return mergeWith(specTemplateRule, MergeStrategy.Default);
    }
  ]);
}

function _ensurePath(tree: Tree, options: any) {
  const workspace: experimental.workspace.WorkspaceSchema = getWorkspace(tree);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];
  if (options.path === undefined) {
    const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/app`;
    const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
    options.path = `${root}${projectDirName}`;
  }
}
