module.exports = {
  files: {
    javascripts: {
      joinTo: 'app.js',
      joinTo: {
        'js/app.js': /^app/,
        'js/vendor.js': /^vendor/,
      }
    },
    stylesheets: {joinTo: 'css/app.css'}
  },

  plugins: {
      pug: {
          pretty: true
      },
      
      afterBrunch: [
          'coffee --compile --output public/js app/scripts'
      ]
    },
    
  paths: {
      public: "../Calculator/public/"
  }
  };
