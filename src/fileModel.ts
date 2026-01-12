import { platform } from './platform';
import { parse } from 'date-fns';
import { ValueError } from './errors';

export class FileInfo {
  readonly fileName: string;
  readonly fullPath: string;
  readonly directoryName: string;
  readonly directoryPath: string;
  readonly size: number;
  readonly extension: string;
  readonly createTime: Date;
  readonly updateTime: Date;
  readonly lastAccessTime: Date;
  readonly isFile: boolean;

  constructor(filePath: string) {
    //console.log('FileInfo', filePath);
    const stats = platform.statSync(filePath);
    this.isFile = stats.isFile();
    if (this.isFile) {
      this.fileName = platform.basename(filePath);
      this.fullPath = platform.resolve(filePath);
      this.directoryName = platform.basename(platform.dirname(filePath));
      this.directoryPath = platform.dirname(platform.resolve(filePath));
      this.extension = platform.extname(filePath);
    } else {
      this.fileName = '';
      this.extension = '';
      this.fullPath = platform.resolve(filePath);
      this.directoryName = platform.basename(platform.dirname(filePath));
      this.directoryPath = platform.dirname(platform.resolve(filePath));
    }
    this.size = stats.size;
    this.createTime = stats.birthtime;
    this.updateTime = stats.mtime;
    this.lastAccessTime = stats.atime;
  }
}

export const FilterType = {
  FileName: 'Name',
  CreateTime: 'Create Time',
  LastAccessTime: 'Last Access Time',
  LastModifiedTime: 'Last Modified Time',
} as const;

export type FilterType = typeof FilterType[keyof typeof FilterType];

export const FileCompareType = {
  Equal: 'Equal',
  Larger: 'Larger',
  Less: 'Less',
  LargerOrEqual: 'LargerOrEqual',
  LessOrEqual: 'LessOrEqual',
} as const;

export type FileCompareType =
  typeof FileCompareType[keyof typeof FileCompareType];

export const FileArchiveType = {
  Zip: 'zip',
  Tgz: 'tgz',
  BZip2: 'bz2',
  GZip: 'gz',
  Tar: 'tar',
  GuessFromFileName: 'unknown',
} as const;
export type FileArchiveType =
  typeof FileArchiveType[keyof typeof FileArchiveType];

export class FileFilterInfo {
  readonly kind: FilterType;
  readonly operator: FileCompareType;
  readonly nameFilter: string;
  readonly targetDate: Date;
  constructor(
    kind: FilterType,
    operator: FileCompareType,
    filter: string | Date
  ) {
    this.kind = kind;
    this.operator = operator;
    if (this.kind === FilterType.FileName && typeof filter === 'string') {
      this.nameFilter = filter;
      this.targetDate = new Date();
    } else if (this.kind !== FilterType.FileName) {
      this.nameFilter = '';
      if (typeof filter === 'string')
        this.targetDate = parse(filter, 'yyyyMMdd', 0);
      else this.targetDate = filter;
    } else {
      throw new ValueError('Date Parameter is invalid:' + filter);
    }
  }
}

export class FileTransportInfo {
  readonly sourceFileName: string;
  readonly sourceFolderName: string;
  readonly basePath: string;
  readonly #destinationFileName: string;
  readonly #destinationFolderName: string;
  readonly deleteSourceFileAfterCompletion: boolean;
  readonly overwriteDestination: boolean;

  readonly isSourceDirectory: boolean;
  readonly isDestinationDirectory: boolean;

  readonly isDestinationRoot: boolean;
  readonly filterConditions?: FileFilterInfo[];

  /**
   * Base	Sdir	Sname	Ddir	Dname		(S)full+base	    (S)Full	    (S)path (S)name (D)full	    (D)path (D)name
   * x   	x	    x	    x	    x		    base\SDir\Sname	    SDir\Sname	SDir    Sname   Ddir\Dname	Ddir    Dname
   * x   	x   	x	    x	    	    	base\SDir\Sname	    SDir\Sname	SDir    Sname   Ddir\Sname	Ddir    Sname
   * x   	x	    x   	    	x	    	base\SDir\Sname	    SDir\Sname	SDir    Sname   SDir\Dname	Sdir    Dname
   * x   	x	    x	    	    	    	base\SDir\Sname	    SDir\Sname	SDir    Sname   SDir\Sname	SDir    Sname
   * x   	x   	    	x   	    		base\SDir	          SDir	    SDir		    Ddir	    Ddir
   * x   	x	                				base\SDir	          SDir	    SDir		    SDir	    SDir
   * x                   						base
   * x	            	x	        		base				                            Ddir	    Ddir
   * x   	    	x   	x   	x	    	base\Sname	        Sname		        Sname	Ddir\Dname	Ddir	Dname
   * x   	    	x	    x	        		base\Sname	        Sname		        Sname	Ddir\Sname	Ddir	Sname
   * x       		x	        	x	    	base\Sname	        Sname		        Sname	Dname		Dname
   * x	        x	            			base\Sname	        Sname		        Sname	Sname		Sname
   *     	x   	x   	x	    x	                            SDir\Sname	SDir	Sname	Ddir\Dname	Ddir	Dname
   * 	    x	    x	    x				                        SDir\Sname	SDir	Sname	Ddir\Sname	Ddir	Sname
   * 	    x	    x		        x			                    SDir\Sname	SDir	Sname	SDir\Dname	SDir	Dname
   * 	    x	    x					                            SDir\Sname	SDir	Sname	SDir\Sname	SDir	Sname
   * 	    x	        	x				                        SDir	    SDir	    	Ddir	    Ddir
   * 	    x						                                SDir	    SDir		    SDir	    SDir
   * 		        x	    x	    x			                    Sname		        Sname	Ddir\Dname	Ddir	Dname
   * 		        x	    x				                        Sname		        Sname	Ddir\Sname	Ddir	Sname
   * 		        x		        x			                    Sname		        Sname	Dname		        Dname
   * 		        x					                            Sname		        Sname	Sname		        Sname
   */

  constructor({
    basePath = '',
    sourceFilename = '',
    sourceFolderName = '',
    destinationFileName = '',
    destinationFolderName = '',
    deleteSourceFileAfterCompletion = false,
    overwriteDestination = false,
    filterConditions = undefined,
  }: {
    basePath?: string;
    sourceFilename?: string;
    sourceFolderName?: string;
    destinationFileName?: string;
    destinationFolderName?: string;
    deleteSourceFileAfterCompletion?: boolean;
    overwriteDestination?: boolean;
    filterConditions?: FileFilterInfo[];
  }) {
    this.basePath = basePath;
    this.sourceFileName = sourceFilename;
    this.sourceFolderName = sourceFolderName;
    this.#destinationFileName = destinationFileName;
    this.#destinationFolderName = destinationFolderName;
    this.deleteSourceFileAfterCompletion = deleteSourceFileAfterCompletion;
    this.overwriteDestination = overwriteDestination;
    this.filterConditions = filterConditions;

    this.isSourceDirectory = !this.sourceFileName;
    this.isDestinationDirectory = !this.destinationFileName;
    this.isDestinationRoot =
      !this.sourceFolderName && !this.#destinationFolderName;

    if (!this.sourceFileName && this.#destinationFileName)
      throw new ValueError('Invalid Parameter');
    if (!this.basePath && !this.sourceFolderName && !this.sourceFileName)
      throw new ValueError('Invalid Parameter');
  }

  get sourceFullName(): string {
    if (!this.sourceFolderName) return this.sourceFileName;
    if (!this.sourceFileName) return this.sourceFolderName;
    return platform.join(this.sourceFolderName, this.sourceFileName);
  }

  get sourceFullNameWithBasePath(): string {
    if (!this.sourceFullName) return this.basePath;
    if (!!this.basePath) return platform.join(this.basePath, this.sourceFullName);
    return this.sourceFullName;
  }

  get destinationFileName(): string {
    if (!this.#destinationFileName) return this.sourceFileName;
    return this.#destinationFileName;
  }

  get destinationPath(): string {
    if (!this.#destinationFolderName) return this.sourceFolderName;
    return this.#destinationFolderName;
  }

  get destinationFullName(): string {
    if (!this.destinationPath) return this.destinationFileName;
    if (!this.destinationFileName) return this.destinationPath;
    return platform.join(this.destinationPath, this.destinationFileName);
  }
}
