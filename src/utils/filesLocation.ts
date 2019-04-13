import * as fs from 'fs';
import * as path from 'path';
export interface IHashCache {
    [details: string] : string;
} 

let cache: IHashCache  = {}

export function FileExistsRecursive( rootPath: string, filename:string) : string
{
    let key = filename;
    let fileCached =  cache[key];
    if (fileCached === undefined )
    {
        let fullpath = path.join(rootPath, filename);
        /*if (fs.existsSync(fullpath))Isso fica mais rapuido, mais nao pega o nome certo
        {
            let fret = new FileCache()
            let stat = fs.lstatSync(fullpath);
            fret.nameInSO = stat.f;
            fret.pathFound = fullpath;            
            cache[key] =  fret;
            return fret;
        }
        else*/
        {
            let dirs = fs.readdirSync(rootPath);
            for (let x = 0; x< dirs.length;x++ )
            {
                let file = dirs[x];
                let subDir = path.join(rootPath, file);
                let stat = fs.lstatSync(subDir);
                if (stat.isDirectory())
                {
                    let fret = FileExistsRecursive(subDir,filename)
                    if (fret !== undefined)
                    {
                        return fret;
                    }
                }
                else
                {
                    if(stat.isFile())
                    {
                        if (path.basename(subDir).toUpperCase() === filename.toUpperCase())
                        {
                            
                            cache[key] =  subDir;
                            return subDir;
                        }

                    }

                }
            }
        }
    }
    else
    {
        let refCache = fileCached;        
        return refCache;
    }
}