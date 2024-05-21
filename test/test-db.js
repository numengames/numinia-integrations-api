module.exports = (mongoose) => {
  async function connect() {
    await mongoose.connect(global.__MONGO_URI__, {});
  }

  async function close() {
    await mongoose.connection.close();
  }

  return {
    close,
    connect,
  };
};
