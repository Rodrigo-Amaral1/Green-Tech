import { sequelize } from './database';
import Lote from '../models/Lote';
import Boleto from '../models/Boleto';

const syncDatabase = async () => {
  try {
    // Sincroniza os modelos com o banco de dados
    await sequelize.sync({ force: true }); // force: true irá recriar as tabelas
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

export default syncDatabase; 