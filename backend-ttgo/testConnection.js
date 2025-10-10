require('mongoose').connect('mongodb+srv://jromeroba24:SwW8kdF9J1fTdf8x@cluster0.v0asgzc.mongodb.net/ttgo_db?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('✅ Conexión exitosa con MongoDB Atlas');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });
