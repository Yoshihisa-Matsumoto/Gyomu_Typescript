import path from 'node:path'
import { ValueError } from '../../error/ValueError.js'
import type { FileFilterInfo } from './filter.js'
import { FullPath } from '../../types.js'

/**
 * Represents the metadata and path configuration for a file transport operation.
 */
export class FileTransportInfo {
  /**
   * The name of the source file.
   */
  readonly sourceFileName: string

  /**
   * The name of the source folder.
   */
  readonly sourceFolderName: string

  /**
   * The base directory path.
   */
  readonly basePath: string

  /**
   * The internal destination filename.
   */
  readonly #destinationFileName: string

  /**
   * The internal destination folder name.
   */
  readonly #destinationFolderName: string

  /**
   * Indicates whether the source file should be deleted after the transport completes.
   */
  readonly deleteSourceFileAfterCompletion: boolean

  /**
   * Indicates whether to overwrite the destination file if it already exists.
   */
  readonly overwriteDestination: boolean

  /**
   * Returns true if the source is identified as a directory.
   */
  readonly isSourceDirectory: boolean

  /**
   * Returns true if the destination is identified as a directory.
   */
  readonly isDestinationDirectory: boolean

  /**
   * Returns true if the destination is located at the root folder level.
   */
  readonly isDestinationRoot: boolean

  /**
   * Optional filters applied to the file transport operation.
   */
  readonly filterConditions?: Array<FileFilterInfo>

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
   *
   * @returns The configured FileTransportInfo instance.
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
    basePath?: string
    sourceFilename?: string
    sourceFolderName?: string
    destinationFileName?: string
    destinationFolderName?: string
    deleteSourceFileAfterCompletion?: boolean
    overwriteDestination?: boolean
    filterConditions?: Array<FileFilterInfo>
  }) {
    this.basePath = basePath
    this.sourceFileName = sourceFilename
    this.sourceFolderName = sourceFolderName
    this.#destinationFileName = destinationFileName
    this.#destinationFolderName = destinationFolderName
    this.deleteSourceFileAfterCompletion = deleteSourceFileAfterCompletion
    this.overwriteDestination = overwriteDestination
    if (filterConditions !== undefined) this.filterConditions = filterConditions

    this.isSourceDirectory = !this.sourceFileName
    this.isDestinationDirectory = !this.destinationFileName
    this.isDestinationRoot = !this.sourceFolderName && !this.#destinationFolderName

    if (!this.sourceFileName && this.#destinationFileName)
      throw new ValueError({
        message: 'Invalid Parameter',
        cause: undefined,
        value: { sourceFilename, destinationFileName },
      })
    if (!this.basePath && !this.sourceFolderName && !this.sourceFileName)
      throw new ValueError({
        message: 'Invalid Parameter',
        cause: undefined,
        value: { basePath, sourceFolderName, sourceFilename },
      })
  }

  /**
   * Retrieves the full source name combining the folder and filename.
   *
   * @returns The full source path string.
   */
  get sourceFullName(): FullPath {
    if (!this.sourceFolderName) return FullPath(this.sourceFileName)
    if (!this.sourceFileName) return FullPath(this.sourceFolderName)
    return FullPath(path.join(this.sourceFolderName, this.sourceFileName))
  }

  /**
   * Retrieves the full source path including the base path.
   *
   * @returns The absolute source path.
   */
  get sourceFullNameWithBasePath(): FullPath {
    if (!this.sourceFullName) return FullPath(this.basePath)
    if (this.basePath) return FullPath(path.join(this.basePath, this.sourceFullName))
    return this.sourceFullName
  }

  /**
   * Returns the destination file name, falling back to the source file name if not defined.
   *
   * @returns The destination filename string.
   */
  get destinationFileName(): string {
    if (!this.#destinationFileName) return this.sourceFileName
    return this.#destinationFileName
  }

  /**
   * Returns the destination path, falling back to the source folder name if not defined.
   *
   * @returns The destination directory path.
   */
  get destinationPath(): string {
    if (!this.#destinationFolderName) return this.sourceFolderName
    return this.#destinationFolderName
  }

  /**
   * Retrieves the full path to the destination.
   *
   * @returns The full destination path string.
   */
  get destinationFullName(): FullPath {
    if (!this.destinationPath) return FullPath(this.destinationFileName)
    if (!this.destinationFileName) return FullPath(this.destinationPath)
    return FullPath(path.join(this.destinationPath, this.destinationFileName))
  }
}
