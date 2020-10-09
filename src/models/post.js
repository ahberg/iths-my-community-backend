export default (sequelize, DataTypes) => {
    const Post = sequelize.define(
      'Post',
      {
        author: DataTypes.BIGINT,
        content:DataTypes.TEXT
      },
      {}
    );
  
    Post.associate = function(models) {
      // associations go here
    };
  
    return Post;
  };
  