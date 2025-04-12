import { Model, DataTypes, Sequelize } from 'sequelize';

class Boleto extends Model {
  public id!: number;
  public nome_sacado!: string;
  public id_lote!: number;
  public valor!: number;
  public linha_digitavel!: string;
  public ativo!: boolean;
  public criado_em!: Date;

  static initModel(sequelize: Sequelize) {
    Boleto.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nome_sacado: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        id_lote: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'lotes',
            key: 'id'
          }
        },
        valor: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        },
        linha_digitavel: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        ativo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        criado_em: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        modelName: 'Boleto',
        tableName: 'boletos',
        timestamps: false
      }
    );

    return Boleto;
  }

  static associate(models: any) {
    Boleto.belongsTo(models.Lote, {
      foreignKey: 'id_lote',
      as: 'lote'
    });
  }
}

export default Boleto; 