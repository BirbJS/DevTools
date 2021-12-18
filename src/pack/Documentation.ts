/*
 * Copyright (c) 2021, knokbak and contributors.
 *
 * The Birb.JS Project: https://birb.js.org
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FS from 'fs';
import Chalk from 'chalk';

/**
 * This is not used in the Birb.JS Project, but is used to
 * build the Birb.JS documentation. This should be executed
 * after building the Birb.JS package, after which it will
 * create a folder called `docs` where the documentation
 * files will be stored (ready to be pushed to the docs
 * [repository](https://github.com/BirbJS/Documentation)).
 */
async function build () {

    console.log(`working in ${process.cwd()}`);
    const path: string = process.cwd() + '/docs';

    if (!FS.existsSync(path)) {
        FS.mkdirSync(path);
    }

    const json: any = require(`${process.cwd()}/docs.json`);
    const fullChildren: { [key: string]: any }[] = json.children;
    const groups: { [key: string]: any }[] = json.groups;

    const TABLE_OF_CONTENTS: string = 
        `### Table of Contents\n` +
        `{: .no_toc .text-delta }\n` +
        `\n` +
        `- TOC\n` +
        `{:toc}\n`;

    for ( let i = 0; i < groups.length; ++i ) {
        let dir = `/${convertBase(groups[i].title).toLowerCase()}`;
        if (!FS.existsSync(path + dir)) FS.mkdirSync(path + dir);

        write(dir + '/index.md',
            `---\n` +
            `layout: default\n` +
            `title: ${convertBase(groups[i].title)}\n` +
            `has_children: true\n` +
            `has_toc: false\n` +
            `---\n` +
            `\n` +
            `# ${convertBase(groups[i].title)}\n` +
            TABLE_OF_CONTENTS
        );

        let children: any[] = fullChildren.filter((c: any) => groups[i].children.includes(c.id));

        for ( let j = 0; j < children.length; ++j ) {
            let page = children[j];
            let md =
                `---\n` +
                `layout: default\n` +
                `title: ${page.name}\n` +
                `parent: ${convertBase(groups[i].title)}\n` +
                `has_children: false\n` +
                `has_toc: true\n` +
                `---\n` +
                `\n` +
                `# ${page.name}${handleTags(page.flags)}\n` +
                TABLE_OF_CONTENTS;

            switch (groups[i].title) {
                case 'Enumerations': {
                    md += `## Members\n`;
                    for ( let k = 0; k < page.children.length; ++k ) {
                        let child = page.children[k];
                        md += `- \`${child.name}\`: ${child.defaultValue ?? 'null'}${handleTags(child.flags)}\n`;
                    }
                    write(dir + `/${page.name}.md`, md);
                    break;
                }
                case 'Classes': {
                    let constructor = page.children.find((c: any) => c.kindString === 'Constructor');
                    let properties = page.children.filter((c: any) => c.kindString === 'Property');
                    let methods = page.children.filter((c: any) => c.kindString === 'Method');

                    if (constructor) {
                        let sig = constructor.signatures[0];
                        md += sig.comment?.shortText ? `${sig.comment?.shortText}\n` : '';
                        md +=
                            `# Constructor${handleTags(constructor.flags)}\n` +
                            `\`\`\`js\n` +
                            `${sig.name}(${formatFnParams(sig.parameters)})\n` +
                            `\`\`\`\n\n` +
                            buildParamTable(sig.parameters);
                    }

                    if (properties.length > 0) {
                        md += `# Properties\n`;
                        for ( let k = 0; k < properties.length; ++k ) {
                            let prop = properties[k];
                            md +=
                                `## ${prop.name}${handleTags(prop.flags)}\n` +
                                (prop.comment?.shortText ? `${prop.comment?.shortText}\n\n` : '') +
                                `**Type:** ${formatType(prop.type)}\n\n`;
                        }
                    }

                    if (methods.length > 0) {
                        md += `# Methods\n`;
                        for ( let k = 0; k < methods.length; ++k ) {
                            let method = methods[k];
                            let sig = method.signatures[0];
                            md +=
                                `## ${method.name}(${formatFnParams(sig.parameters)})${handleTags(method.flags)}\n` +
                                (sig.comment?.shortText ? `${sig.comment?.shortText}\n\n` : '') +
                                buildParamTable(sig.parameters) +
                                `**Returns:** ${formatType(sig.type)}\n\n`;
                        }
                    }
                    write(dir + `/${page.name}.md`, md);
                    break;
                }
                case 'Type aliases': {
                    md += `## Definition${handleTags(page.flags)}\n`;
                    for ( let k = 0; k < page.type.types.length; ++k ) {
                        let type = page.type.types[k];
                        md += `- ${formatType(type)}\n`;
                    }
                    write(dir + `/${page.name}.md`, md);
                    break;
                }
                default: {
                    console.warn(Chalk.redBright(`miss: ${dir}/${page.name}.md`));
                    break;
                }
            }
        }
    }

    function formatType (type: any): string {
        switch (type.type) {
            case 'reference': {
                if (type.typeArguments) {
                    return `${type.name}<${type.typeArguments.map((t: any) => formatType(t)).join(', ')}>`;
                } else {
                    let ref: any = fullChildren.find((c: any) => c.id === type.id);
                    if (ref) {
                        let base = kindStringToUrl(ref.kindString);
                        if (!base) return `${type.name}`;
                        return `[${ref.name}](/${base}/${ref.name})`;
                    } else return `${type.name}`;
                }
            }
            case 'union': {
                let types: string[] = [];
                for ( let i = 0; i < type.types.length; ++i ) {
                    types.push(formatType(type.types[i]));
                }
                return types.join(' \\| ');
            }
            case 'literal': {
                return typeMoreInfo(`${type.value}`);
            }
            case 'intrinsic': {
                return typeMoreInfo(`${type.name}`);
            }
            default: {
                return typeMoreInfo(type.name || 'Object');
            }
        }
    }

    function typeMoreInfo (name: string): string {
        let mdn = ['object', 'string', 'number', 'boolean', 'symbol', 'null', 'undefined'];
        if (mdn.includes(name.toLowerCase())) {
            return `*[${name}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${name})*`;
        } else return name;
    }

    function kindStringToUrl (kind: string): string | null {
        switch (kind) {
            case 'Class': return 'classes';
            case 'Enumeration': return 'enums';
            case 'Interface': return 'interfaces';
            default: return null;
        }
    }

    function formatFnParams (params: any[] = []): string {
        let inside: string[] = [];
        for ( let i = 0; i < params.length; ++i ) {
            let param = params[i];
            if (param.flags.isOptional) inside.push(`${param.name}?`);
                else inside.push(`${param.name}`);
        }
        return inside.join(', ');
    }

    function buildParamTable (params: any[] = []): string {
        if (!params.length) return '';
        let rows: string[] = [];
        rows.push('| name | type | description | optional | default |');
        rows.push('|:-----|:-----|:------------|:---------|:--------|');
        for ( let i = 0; i < params.length; ++i ) {
            let param = params[i];
            let row: string[] = [
                `${param.name || ' '}`,
                `${formatType(param.type) || 'Object'}`,
                `${param.comment?.shortText || ' '}`,
                `${param.flags.isOptional ? 'true' : 'false'}`,
                `${param.defaultValue ?? '*none*'}`
            ];
            rows.push(`| ${row.join(' | ').replace(/(\r\n|\n|\r)/gm, ' ')} |`);
        }
        return rows.join('\n') + '\n\n';
    }

    function handleTags (flags: any): string {
        let tags: string = '';
        if (flags.isStatic) tags += '\n{: .d-inline-block }\n\nSTATIC\n{: .label .label-blue }';
        if (flags.isReadonly) tags += '\n{: .d-inline-block }\n\nREADONLY\n{: .label .label-purple }';
        if (flags.isPrivate) tags += '\n{: .d-inline-block }\n\nPRIVATE\n{: .label .label-red }';
        if (flags.isProtected) tags += '\n{: .d-inline-block }\n\nPROTECTED\n{: .label .label-red }';
        if (flags.isAbstract) tags += '\n{: .d-inline-block }\n\nABSTRACT\n{: .label .label-yellow }';
        if (flags.isDeprecated) tags += '\n{: .d-inline-block }\n\nDEPRECATED\n{: .label .label-red }';
        if (tags.length) return tags + '\n';
        return tags;
    }

    function convertBase (base: string) {
        if (base == 'Type aliases') return 'Types';
        return base;
    }

    function write (p: string, v: string) {
        console.log(Chalk.greenBright(`write: ${p}`));
        FS.writeFileSync(path + p, v, 'utf8');
    }

}

build();
