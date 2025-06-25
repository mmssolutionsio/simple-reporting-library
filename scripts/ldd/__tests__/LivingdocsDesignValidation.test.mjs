import { jest, test, expect } from '@jest/globals';
import { LivingdocsDesignValidator } from '../LivingdocsDesignValidator.js';

test('returns true when usedPropertiesAreDeclared', () => {
  expect(
    new LivingdocsDesignValidator({
      componentProperties: {
        property: {},
      },
      components: [
        {
          name: 'some-component',
          properties: ['property'],
        },
      ],
    }).usedPropertiesAreDeclared(),
  ).toBe(true);
});

test('throws error when used property is not declared', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      componentProperties: {},
      components: [
        {
          name: 'some-component',
          properties: ['invalid-property'],
        },
      ],
    }).usedPropertiesAreDeclared(),
  ).toThrow();
});

test('returns true when every component has a group', () => {
  expect(
    new LivingdocsDesignValidator({
      groups: [
        {
          label: 'a group',
          components: ['acomponent'],
        },
      ],
      components: [
        {
          name: 'acomponent',
        },
      ],
    }).everyComponentHasAGroup(),
  ).toBe(true);
});

test('throws error when a component does not have a group', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      groups: [
        {
          label: 'agroup',
          components: ['other component'],
        },
      ],
      components: [
        {
          name: 'throwed component',
        },
      ],
    }).everyComponentHasAGroup(),
  ).toThrow();
});

test('returns true when all declared directives exist on component', () => {
  expect(
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'a component',
          directives: {
            text: {},
            link: {},
          },
          html: `<div><p doc-editable="text">Text</p><a doc-editable="link-text" doc-link="link">link text</a></div>`,
        },
      ],
    }).everyDeclaredDirectiveExistsOnComponent(),
  ).toBe(true);
});

test('throws error when declared directive does not exist on component', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'missing directive',
          directives: { test: {} },
          html: `<p></p>`,
        },
      ],
    }).everyDeclaredDirectiveExistsOnComponent(),
  ).toThrow();
});

test('returns true when container directive allows valid components', () => {
  expect(
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'parent',
          directives: {
            container: {
              allowedChildren: ['child'],
              defaultContent: [
                {
                  component: 'child',
                },
              ],
            },
          },
          html: `<div doc-container="container"></div>`,
        },
        {
          name: 'child',
          html: `<p>child</p>`,
        },
      ],
    }).everyDeclaredDirectiveExistsOnComponent(),
  ).toBe(true);
});

test('returns true when container directive does not have allowed children', () => {
  expect(
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'marginal-container',
          html: `<div doc-container="container"></div>`,
          directives: {
            container: {},
          },
        },
      ],
    }).everyDeclaredDirectiveExistsOnComponent(),
  ).toBe(true);
});

test('throws error when container directive does not contain valid children', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'container',
          directives: {
            container: {
              allowedChildren: ['invlid component'],
            },
          },
          html: `<div doc-container="container></div>`,
        },
      ],
    }).everyDeclaredDirectiveExistsOnComponent(),
  ).toThrow();
});

test('throws error when there are double link directives in component', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'double-link',
          html: `<div><a doc-link="link1"></a><a doc-link="link2"></a></div>`,
        },
      ],
    }).everyDeclaredDirectiveExistsOnComponent(),
  ).toThrow();
});

test('returns true when all allowed parents exist in container', () => {
  expect(
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'marginal-container',
          html: `<div doc-container="container"></div>`,
        },
        {
          name: 'child',
          html: `<p>child</p>`,
          allowedParents: ['marginal-container', 'root'],
        },
      ],
    }).everyAllowedParentExistsInDesign(),
  ).toBe(true);
});

test('throws error when allowed parent does not exist', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'i will fail',
          allowedParents: ['chrüsimüsi'],
          html: '<p></p>',
        },
      ],
    }).everyAllowedParentExistsInDesign(),
  ).toThrow();
});

test('returns true when there are no duplicate component names', () => {
  expect(
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'component',
          html: '<p></p>',
        },
        {
          name: 'other-component',
          html: '<p></p>',
        },
      ],
    }).hasNoDuplicateComponentNames(),
  ).toBe(true);
});

test('throws error when there are duplicate component names', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      components: [
        {
          name: 'component',
          html: '<p></p>',
        },
        {
          name: 'component',
          html: '<a></a>',
        },
      ],
    }).hasNoDuplicateComponentNames(),
  ).toThrow();
});

test('returns true when there are no duplicate group names', () => {
  expect(
    new LivingdocsDesignValidator({
      groups: [
        {
          label: 'group 1',
          components: ['comp1', 'comp2'],
        },
        {
          label: 'group 2',
          components: ['comp1', 'comp2'], // is it even possible to have a component in two groups?
        },
      ],
    }).hasNoDuplicateGroupLabels(),
  ).toBe(true);
});

test('throws an error when there are duplicate group names', () => {
  expect(() =>
    new LivingdocsDesignValidator({
      groups: [
        {
          label: 'group',
          components: ['comp1', 'comp2'],
        },
        {
          label: 'group',
          components: ['comp1', 'comp2'],
        },
      ],
    }).hasNoDuplicateGroupLabels(),
  ).toThrow();
});
