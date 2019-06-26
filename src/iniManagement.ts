import { isEnvironmentSelected, createAdvplCompile } from './extension';
var INI = require('ini');

export interface IIniEnvironment {
    Environment: string;
    SourcePath: string;
    RootPath: string;
}

export class IniManagement {
    private _Environments: IIniEnvironment[];
    public get Environments(): IIniEnvironment[] {
        return this._Environments;
    }

    private _IniContent: string;
    public get IniContent(): string {
        return this._IniContent;
    }

    private _IniObject: Object;
    public get IniObject(): Object {
        return this._IniObject;
    }

    constructor(iniContent?: string) {

        // Caso não tenha informado o INI, busca o mesmo
        if (!iniContent) {
            this._IniContent = iniContent;
        }

        // Inicializa o Array de ambientes
        this._Environments = [];
    }

    public GetIniContent(): Thenable<void> {
        var that = this;

        // TODO: Utilizar Progress enquanto carrega para melhorar a UX.

        return new Promise((resolve) => {
            // Verifica se está selecionado um ambiente
            if (!isEnvironmentSelected()) {
                return;
            }

            // Cria o objeto de compilação
            let compile = createAdvplCompile(null, null);

            // Chama o método da classe que busca o INI
            if (!(compile == null)) {
                compile.getINI(
                    function (iniContent) {
                        that._IniContent = iniContent;
                        resolve();
                    }
                )
            }

        });
    }

    public GetEnvironments(): IniManagement {
        if (this.IniContent) {
            // Transforma o INI (string) em Objeto
            this._IniObject = INI.decode(this.IniContent);

            // Mapeia todos os atributos do objeto procurando os itens que são de ambientes (RPO)
            Object.keys(this._IniObject).map(
                key => {
                    // Caso o objeto possua o atributo SourcePath (caminho do RPO) adiciona-o no Array de ambientes
                    if (this._IniObject[key].hasOwnProperty("SourcePath")) {
                        this._Environments.push({
                            Environment: key.toUpperCase(),
                            SourcePath: this._IniObject[key]["SourcePath"],
                            RootPath: this._IniObject[key]["RootPath"]
                        }
                        )
                    }
                }
            );
        }

        return this;
    }
}