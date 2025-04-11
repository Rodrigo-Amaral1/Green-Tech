import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Lote extends Model {
  public id!: number;
  public nome!: string;
  public ativo!: boolean;
  public readonly criado_em!: Date;
}

Lote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Lote',
    tableName: 'lotes',
    timestamps: false,
  }
);

export default Lote; 