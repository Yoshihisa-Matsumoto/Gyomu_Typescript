import { ValueError } from '@gyomu/shared';
import { platform } from '../../infrastructure/fs/index.js';
import { FileFilterInfo } from './filter.js';

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
      throw new ValueError({
        message: 'Invalid Parameter',
        cause: undefined,
        value: { sourceFilename, destinationFileName },
      });
    if (!this.basePath && !this.sourceFolderName && !this.sourceFileName)
      throw new ValueError({
        message: 'Invalid Parameter',
        cause: undefined,
        value: { basePath, sourceFolderName, sourceFilename },
      });
  }

  get sourceFullName(): string {
    if (!this.sourceFolderName) return this.sourceFileName;
    if (!this.sourceFileName) return this.sourceFolderName;
    return platform.join(this.sourceFolderName, this.sourceFileName);
  }

  get sourceFullNameWithBasePath(): string {
    if (!this.sourceFullName) return this.basePath;
    if (this.basePath) return platform.join(this.basePath, this.sourceFullName);
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
