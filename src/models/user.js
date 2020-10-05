export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: DataTypes.STRING,
      name: DataTypes.STRING,
      password: DataTypes.STRING,
      bio:DataTypes.TEXT
    },
    {}
  );

  User.associate = function(models) {
    // associations go here
  };

  return User;
};
