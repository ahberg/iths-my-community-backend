export default (sequelize, DataTypes) => {
    const Post = sequelize.define(
      'Post',
      {
        content:DataTypes.TEXT
      },
      {}
    );
  
    Post.associate = function(models) {
      Post.belongsTo(models.User,{ 
        foreignKey: 'author'
      });
    };
  
    return Post;
  };
  