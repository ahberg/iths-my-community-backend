export default (sequelize, DataTypes) => {
  const Follower = sequelize.define(
    "Follower",
    {},
    {
      timestamps: false,
    }
  );
  Follower.removeAttribute("id");

  Follower.associate = function (models) {
    Follower.belongsTo(models.User, {
      foreignKey: {
        field: "ownerId",
        allowNull: false,
        primaryKey: true,
      },
      as: "owner",
    });
    Follower.belongsTo(models.User, {
      foreignKey: {
        field: "targetId",
        allowNull: false,
        primaryKey: true,
      },
      as: "target",
    });
  };

  return Follower;
};
