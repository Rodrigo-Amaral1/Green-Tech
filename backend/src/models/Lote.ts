import { Model, DataTypes, Sequelize } from 'sequelize';

class Lote extends Model {
  public id!: number;
  public nome!: string;
  public ativo!: boolean;
  public criado_em!: Date;

  static initModel(sequelize: Sequelize) {
    Lote.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        nome: {
          type: DataTypes.STRING(100),
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
        modelName: 'Lote',
        tableName: 'lotes',
        timestamps: false
      }
    );

    return Lote;
  }

  static associate(models: any) {
    Lote.hasMany(models.Boleto, {
      foreignKey: 'id_lote',
      as: 'boletos'
    });
  }
}

export default Lote; 