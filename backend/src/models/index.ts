import sequelize from '../config/database';
import Lote from './Lote';
import Boleto from './Boleto';

const models = {
  Lote,
  Boleto
};

// Initialize all models
Object.values(models).forEach((model: any) => {
  if (model.initModel) model.initModel(sequelize);
});

// Set up associations after all models are initialized
Object.values(models).forEach((model: any) => {
  if (model.associate) model.associate(models);
});

export default models; 