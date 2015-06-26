module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.file %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files:{
          'dest/js/<%=pkg.file %>.min.js' : ['src/js/<%=pkg.file %>.js']
        }
      }
    },
    cssmin: {
      compress: {
        files: {
          'dest/css/myDialogs.min.css': ["src/css/myDialogs.css"]
        }
      }
    }
  });
  // 加载提供"uglify"任务的插件
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  
  
  // 默认任务
  grunt.registerTask('default', ['uglify','cssmin']);
}