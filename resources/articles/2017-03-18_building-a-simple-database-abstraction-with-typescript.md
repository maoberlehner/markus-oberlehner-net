---
title: "Building a simple (but overengineered) database abstraction with TypeScript"
description: "Using TypeScript to build a simple database abstraction. The database uses a file driver to load Markdown files from a directory on the file system."
intro: "Two weeks ago, I had this idea for an app. I decided this was the perfect opportunity to give Ionic a try. Long story short – I quickly realized it would be too much work to build the app I had in mind. But I found the technologies used by Ionic 2 pretty interesting..."
---

# Building a simple (but overengineered) database abstraction with TypeScript
Two weeks ago, I had this idea for an app. I decided this was the perfect opportunity to give [Ionic](http://ionicframework.com/) a try. Long story short – I quickly realized it would be too much work to build the app I had in mind. But I found the technologies used by Ionic 2 to be interesting. Ionic 2 is built on top of Angular 2 which in turn is built with [TypeScript](https://www.typescriptlang.org/). I'm not quite sure yet if I like Angular 2 or not but TypeScript definitely caught my attention.

I'm currently in the process of rewriting some of my projects using the [TDD approach](https://markus.oberlehner.net/blog/2017/02/test-driven-development-with-javascript-using-ava-and-sinonjs/) and after I did some more research on TypeScript I was quite tempted to also use TypeScript in favor of vanilla JavaScript. Today I started rewriting the static site generator which is powering this blog (which I initially hacked together not caring too much about the quality of the code) with TypeScript, beginning with implementing a (file based) database.

## The directory structure
What we're going to build is a database abstraction layer which uses a driver to access data from wherever the driver decides. In this case we're using a file driver which pulls content from a `resources` directory. The file driver uses an extractor implementation to generate an object from the contents of a Markdown file.

```
resources/
└── articles/
    ├── an-article.md
    └── another-article.md
src/
├── classes/
│   ├── Database.ts
│   ├── FileDriver.ts
│   └── MarkdownExtractor.ts
├── interfaces/
│   ├── IDatabase.ts
│   ├── IExtractor.ts
│   └── IModel.ts
├── models/
│   └── Article.ts
└── index.js
```

## The database class
First of all we're going to implement the database class and a corresponding interface.

```ts
interface IDatabase {
  getAll: (table: string) => Array<object>;
  getById: (id: any, table: string) => object;
}
```

We're keeping it simple – our database interface defines two methods. `getAll` takes a table name as `string` and returns an `Array` of `objects`. `getById` takes an id which can be of `any` type and also the name of a table as a `string`, this method returns an `object`.

```ts
import IDatabase from '../interfaces/IDatabase';

export class Database implements IDatabase {
  private driver: IDatabase;

  constructor(driver: IDatabase) {
    this.driver = driver;
  }

  public getAll(table: string) {
    return this.driver.getAll(table);
  }

  public getById(id: any, table: string) {
    return this.driver.getById(id, table);
  }
}

export default function databaseFactory(driver: IDatabase) {
  return new Database(driver);
}
```

The database class implements the interface we defined in the first step. It calls the corresponding methods on the driver which is injected in the class instance. Other than that, not much work is done in this class – the driver is doing the real work.

We're using the [testable module pattern](https://markus.oberlehner.net/blog/2017/02/the-testable-module-pattern/) for our modules, therefore the default export is a factory function which handles the instantiation of the class for us.

## Building a file driver
The file driver is responsible to pull the content from the file system and return an object which the database class can use as a return value.

By using drivers it is easily possible to switch out the database driver. For example you could replace the file driver with a MySQL driver to pull content from a MySQL database instead of the file system.

```ts
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

// We're reusing the database interface.
import IDatabase from '../interfaces/IDatabase';
import IExtractor from '../interfaces/IExtractor';

export class FileDriver implements IDatabase {
  private glob: any;
  private path: any;
  private fs: any;
  private extractor: (fileContent: string) => IExtractor;
  private cwd: string;

  constructor(glob, path, fs, extractor, cwd: string) {
    this.glob = glob;
    this.path = path;
    this.fs = fs;
    this.extractor = extractor;
    this.cwd = cwd;
  }

  public getAll(table: string): Array<object> {
    const globPattern = path.resolve(this.cwd, `resources/${table}/*.md`);
    return this.glob.sync(globPattern)
      .map((file) => {
        const fileContent: string = this.readFile(file);
        return this.extractData(fileContent);
      });
  }

  public getById(id: string, table: string): object {
    const file = this.path.resolve(this.cwd, `resources/${table}/${id}.md`);
    const fileContent: string = this.readFile(file);

    return this.extractData(fileContent);
  }

  private readFile(file: string): string {
    return this.fs.readFileSync(file, `utf8`);
  }

  private extractData(fileContent: string): object {
	  // The extractor is responsible for
		// extracting data from a file string.
    return this.extractor(fileContent).extractData();
  }
}

export default function fileDriverFactory(
  extractor,
  cwd: string,
): FileDriver {
  return new FileDriver(glob, path, fs, extractor, cwd);
}
```

The `readFile` method is loading the contents of a file from the file system. `extractData` uses an implementation of an extractor to create an object from the contents of a file.

## The extractor extracts the data
We could use the file driver to load all sorts of files. In our example we use Markdown but we also could use JSON or YAML or some other hipster data format. To be flexible in which data format we're using, the logic to extract the data is implemented in a separate extractor class. If at some point in the future we would decide to use JSON instead of Markdown, we just have to change the extractor which we're injecting into the file driver instance we're using.

```ts
interface IExtractor {
  extractData: () => object;
}

export default IExtractor;
```

```ts
import * as yaml from 'js-yaml';

import IExtractor from '../interfaces/IExtractor';

export class MarkdownExtractor implements IExtractor {
  private yaml: any;
  private fileContent: string;
  private headerRegex: RegExp;

  constructor(yaml, fileContent: string) {
    this.yaml = yaml;
    this.fileContent = fileContent;
    this.headerRegex = /^---([\s\S]*?)---/i;
  }

  public extractData(): object {
    // Extract YAML data from the
    // top of a Markdown file.
    const headerData = this.extractHeader();
    // Extract the Markdown content.
    const content = this.extractContent();

    return Object.assign(headerData, { content });
  }

  public extractHeader(): object {
    const header: string = this.fileContent.match(this.headerRegex)[1].trim();

    return this.yaml.safeLoad(header);
  }

  public extractContent(): string {
    return this.fileContent.replace(this.headerRegex, ``).trim();
  }
}

export default function markdownExtractorFactory(
	fileContent: string,
): MarkdownExtractor {
  return new MarkdownExtractor(yaml, fileContent);
}
```

With this markdown extractor implementation it is also possible to extract YAML data from the top of a markdown file.

## We need more abstraction
At this point our database abstraction is ready to use.

```ts
import databaseFactory from './classes/Database';
import fileDriverFactory from './classes/FileDriver';
import markdownExtractorFactory from './classes/MarkdownExtractor';

const cwd = process.cwd();

const dbDriver = fileDriverFactory(markdownExtractorFactory, cwd);
const db = databaseFactory(dbDriver);

console.log(db.getAll(`articles`));
```

What we're doing here is to let the factories do their work and build a database instance with all it's dependencies (most notably the file driver) injected and ready to use. By calling `db.getAll('articles')` we're getting an array of objects filled with the data from the Markdown files on the file system.

This is nice but more is always better and therefore more abstraction is also better than less abstraction – so let's implement a model to make it a little more straightforward to get articles from the database.

### The article model

```ts
import IDatabase from './IDatabase';

interface IModel extends IDatabase {
  table: string;
}

export default IModel;
```

```ts
import IDatabase from '../interfaces/IDatabase';
import IModel from '../interfaces/IModel';

export class Article implements IModel {
  public table: string = `articles`;
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
  }

  public getAll() {
    return this.db.getAll(this.table);
  }

  public getById(id: any) {
    return this.db.getById(id, this.table);
  }
}

export default function articleFactory(db: IDatabase): Article {
  return new Article(db);
}
```

Now we don't have to specify the table if we wan't to get articles from the database. Which is admittedly not that big of a deal – but heyyy: we added another layer of abstraction (and we have an example for an interface extending another interface).

```ts
import databaseFactory from './classes/Database';
import fileDriverFactory from './classes/FileDriver';
import markdownExtractorFactory from './classes/MarkdownExtractor';
import articleFactory from './models/Article';

const cwd = process.cwd();

const dbDriver = fileDriverFactory(markdownExtractorFactory, cwd);
const db = databaseFactory(dbDriver);
const article = articleFactory(db);

console.log(article.getAll());
```

## Final thoughts
I really like TypeScript. I especially like the introduction of interfaces into the JavaScript world. Also the combination of Visual Studio Code and TypeScript makes working with JavaScript a lot of fun again. Jump to reference, code completion, parameter hints,... it's just awesome.

If you want to play around with the code yourself, [all the code is available on GitHub](https://github.com/maoberlehner/typescript-database-abstraction).
