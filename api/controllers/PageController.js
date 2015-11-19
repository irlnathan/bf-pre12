/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  home: function(req, res) {

    if (!req.session.userId) {
      return res.view('homepage', {
        me: null
      });
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage', {
          me: null
        });
      }

      return res.view('homepage', {
        me: {
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        },
        showAddTutorialButton: true
      });
    });
  },

  logout: function(req, res) {

    if (!req.session.userId) {
      return res.redirect('/');
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        console.log('error: ', err);
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      return res.view('signout', {
        me: {
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        }
      });
    });
  },

  editProfile: function(req, res) {

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        console.log('error: ', err);
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      return res.view('edit-profile', {
        me: {
          email: user.email,
          username: user.username,
          gravatarURL: user.gravatarURL,
          admin: user.admin
        }
      });
    });
  },

  profile: function(req, res) {

    // var tutorials = [{
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 1,
    //   created: 'a month ago',
    //   totalTime: '3h 22m',
    //   stars: 4
    // }, {
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 2,
    //   created: 'a month ago',
    //   totalTime: '3h 22m',
    //   stars: 3
    // }, {
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 3,
    //   created: 'a month ago',
    //   totalTime: '3h 22m',
    //   stars: 5
    // }, {
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 4,
    //   created: 'a month ago',
    //   totalTime: '3h 22m',
    //   stars: 1
    // }];

    // Look up the user record for the `username` parameter
    User.findOne({
      username: req.param('username')
    })
    .populate('tutorials')
    .exec(function(err, foundByUsername) {
      if (err) {
        return res.negotiate(err);
      }

      // If no user exists with the username specified in the URL,
      // show the 404 page.
      if (!foundByUsername) {
        return res.notFound();
      }

      // If the requesting user-agent is not logged-in,
      // just show the profile page.
      if (!req.session.userId) {
        return res.view('profile', {
          me: null,
          username: foundByUsername.username,
          gravatarURL: foundByUsername.gravatarURL,

          // changed from tutorials (fake above) to foundByUsername

          tutorials: foundByUsername.tutorials
        });
      }

      // Otherwise the user-agent IS logged in.

      // Look up the logged-in user from the database.
      User.findOne({id: req.session.userId}).exec(function (err, loggedInUser){
        if (err) {
          return res.negotiate(err);
        }

        if (!loggedInUser) {
          return res.serverError('User record from logged in user is missing?');
        }

        // We'll provide `me` as a local to the profile page view.
        // (this is so we can render the logged-in navbar state, etc.)
        var me = {
          username: loggedInUser.username,
          email: loggedInUser.email,
          gravatarURL: loggedInUser.gravatarURL,
          admin: loggedInUser.admin
        };

        // We'll provide the `isMe` flag to the profile page view
        // if the logged-in user is the same as the user whose profile we looked up earlier.
        if (req.session.userId === foundByUsername.id) {
          me.isMe = true;
        }
        
        // Return me property for the nav and the remaining properties for the profile page.
        return res.view('profile', {
          me: me,
          showAddTutorialButton: true,
          username: foundByUsername.username,
          gravatarURL: foundByUsername.gravatarURL,

          // changed from tutorials (fake above) to foundByUsername

          tutorials: foundByUsername.tutorials
        });
      }); //</ User.findOne({id: req.session.userId})
    });// </find user by username>
  },

  signin: function(req, res) {

    return res.view('signin', {
      me: null
    });
  },

  signup: function(req, res) {

    return res.view('signup', {
      me: null
    });
  },

  restoreProfile: function(req, res) {

    return res.view('restore-profile', {
      me: null
    });
  },

  administration: function(req, res) {

    User.findOne(req.session.userId, function(err, user) {

      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage');
      }

      if (!user.admin) {
        return res.redirect('/');
      } else {
        return res.view('administration', {
          me: {
            username: user.username,
            gravatarURL: user.gravatarURL,
            admin: user.admin
          },
          showAddTutorialButton: true
        });
      }
    });
  },

  // #1
  passwordRecoveryEmail: function(req, res) {

    return res.view('./password-recovery/password-recovery-email', {
      me: null
    });
  },

  // #2
  passwordRecoveryEmailSent: function(req, res) {

    return res.view('./password-recovery/password-recovery-email-sent', {
      me: null
    });
  },

  // #3
  passwordReset: function(req, res) {

    // Get the passwordRecoveryToken and render the view
    res.view('./password-recovery/password-reset', {
      me: null,
      passwordRecoveryToken: req.param('passwordRecoveryToken')
    });

  },

  showBrowsePage: function(req, res) {

    // If not logged in set `me` property to `null` and pass tutorials to the view
    if (!req.session.userId) {
      return res.view('browse-tutorials-list', {
        me: null
      });
    }

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.view('homepage', {
          me: null
        });
      }

      return res.view('browse-tutorials-list', {
        me: {
          email: user.email,
          gravatarURL: user.gravatarURL,
          username: user.username,
          admin: user.admin
        },
        showAddTutorialButton: true
      });
    });
  },

  tutorialDetail: function(req, res) {

    // Fake tutorials detail dictionary 
    // var tutorial = {
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 1,
    //   created: 'a month ago',
    //   updated: 'a month ago',
    //   totalTime: '3h 22m',
    //   stars: 4,
    //   videos: [{
    //     id: 55,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 23,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 34,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 64,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 95,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 106,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 73,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 88,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 96,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }, {
    //     id: 108,
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 10,
    //     seconds: 22
    //   }]
    // };

    Tutorial.findOne(req.param('id')).exec(function(err, tutorial){
      if (err) return res.negotiate(err);
      if (!tutorial) return res.notFound();

      tutorial.created = DatetimeService.getTimeAgo({date: tutorial.createdAt});
      tutorial.updated = DatetimeService.getTimeAgo({date: tutorial.updatedAt});

      // Calculate the totalTime for a tutorial and each video. 
      
      // Holds total seconds for tutorial
      var totalSeconds=0;
      if (tutorial.videos.length > 0) {
        _.each(tutorial.videos, function(video){

          // Aggregate totalSeconds for tutoiral
          totalSeconds = totalSeconds + video.lengthInSeconds;

          // Format total time for each video
          var seconds = video.lengthInSeconds % 60;
          var minutes = Math.floor(video.lengthInSeconds / 60 % 60);
          var hours = Math.floor(video.lengthInSeconds / 60 / 60);

          video.totalTime = hours + 'h ' + minutes + 'm ' + seconds + 's ';
        });
        
        // Format total time for tutorial  
        var hours = Math.floor(totalSeconds/60 / 60);
        var minutes = Math.floor(totalSeconds / 60 % 60);
        var seconds = totalSeconds % 60;

        tutorial.totalTime = hours + 'h ' + minutes + 'm ' + seconds + 's';
      }

      // If not logged in set `me` property to `null` and pass the tutorial to the view
      if (!req.session.userId) {
        return res.view('tutorials-detail', {
          me: null,
          stars: tutorial.stars,
          tutorial: tutorial
        });
      }

      User.findOne(req.session.userId, function(err, user) {
        if (err) {
          return res.negotiate(err);
        }

        if (!user) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.view('tutorials-detail', {
            me: null
          });
        }

        // We'll provide `me` as a local to the profile page view.
        // (this is so we can render the logged-in navbar state, etc.)
        var me = {
          gravatarURL: user.gravatarURL,
          username: user.username,
          admin: user.admin
        };

        if (user.username === tutorial.owner) {
          me.isMe = true;

          return res.view('tutorials-detail', {
            me: me,
            stars: tutorial.stars,
            tutorial: tutorial
          });

        } else {
          return res.view('tutorials-detail', {
            me: {
              gravatarURL: user.gravatarURL,
              username: user.username,
              admin: user.admin
            },
            stars: tutorial.stars,
            tutorial: tutorial
          });
        }
      });
    });
  },

  newTutorial: function(req, res) {

    User.findOne(req.session.userId, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }

      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
        return res.redirect('tutorials');
      }

      return res.view('tutorials-detail-new', {
        me: {
          gravatarURL: user.gravatarURL,
          username: user.username,
          admin: user.admin
        }
      });
    });
  },

  editTutorial: function(req, res) {

    // Fake tutorials detail dictionary 
    // var tutorial = {
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 1
    // };

    Tutorial.findOne({id: req.param('id')}).exec(function (err, tutorial){
      if (err) return res.negotiate(err);

      if (!tutorial) return res.notFound();

      User.findOne(req.session.userId, function(err, user) {
        if (err) {
          return res.negotiate(err);
        }

        if (!user) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.redirect('/tutorials');
        }

        if (user.username !== tutorial.owner) {

          return res.redirect('/tutorials/'+tutorial.id);

        }

        return res.view('tutorials-detail-edit', {
          me: {
            gravatarURL: user.gravatarURL,
            username: user.username,
            admin: user.admin
          },
          tutorial: tutorial
        });
      });
    });
  },

  newVideo: function(req, res) {

    // var tutorial = {
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   id: 1,
    //   created: 'a month ago',
    //   totalTime: '3h 22m',
    // };

    Tutorial.findOne({id: req.param('id')}).exec(function(err, foundTutorial){
      if (err) return res.negotiate(err);
      if (!foundTutorial) return res.notFound();

      User.findOne(req.session.userId, function(err, user) {
        if (err) {
          return res.negotiate(err);
        }

        if (!user) {
          sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
          return res.redirect('/');
        }

        if (user.username !== foundTutorial.owner) {

          return res.redirect('/tutorials/'+foundTutorial.id);

        }

        return res.view('tutorials-detail-video-new', {
          me: {
            username: user.username,
            gravatarURL: user.gravatarURL,
            admin: user.admin
          },
          
          // stars: foundTutorial.stars,
          tutorial: foundTutorial
        });
      });
    });
  },

  editVideo: function(req, res) {

    // var tutorial = {
    //   // We need the `id` for the cancel back to the tutorial.
    //   id: 1,
    //   title: 'The best of Douglas Crockford on JavaScript.',
    //   description: 'Understanding JavaScript the good parts, and more.',
    //   owner: 'sails-in-action',
    //   created: 'a month ago',
    //   totalTime: '3h 22m',
    //   stars: 4,
    //   video: {
    //     title: 'Crockford on JavaScript - Volume 1: The Early Years',
    //     src: 'https://www.youtube.com/embed/JxAXlJEmNMg',
    //     minutes: 102,
    //     seconds: 8
    //   }
    // };

    // Find the tutorial using `tutorialId`
    Tutorial.findOne({
      id: req.param('tutorialId')
    }).exec(function (err, tutorial){

      if (err) return res.negotiate(err);
      if (!tutorial) return res.notFound();

      // Find the video using `id`
      Video.findOne({
        id: req.param('id')
      }).exec(function (err, video){

        if (err) return res.negotatiate(err);
        if (!tutorial) return res.notFound();

        // TODO: Add policy that requires a session

        // Find the the user with the current session `userId`
        User.findOne(req.session.userId, function(err, user) {
          if (err) {
            return res.negotiate(err);
          }

          if (!user) {
            sails.log.verbose('Session refers to a user who no longer exists- did you delete a user, then try to refresh the page with an open tab logged-in as that user?');
            return res.redirect('/');
          }

          // If the current user is not the creator of the tutorial redirect
          if (user.username !== tutorial.owner) {

            return res.redirect('/tutorials/' + tutorial.id);

          }

          // Find the video by `id` in the Tutorial video array
          var updatedVideo = _.find(tutorial.videos, function(video) {
            return video.id === parseInt(req.param('id'));
          });

          // Convert lengthInSeconds to minutes and seconds and assign to updatedVideo
          updatedVideo.minutes = Math.floor(video.lengthInSeconds/60);
          updatedVideo.seconds = video.lengthInSeconds % 60;

          // Return the locals for the navigation bar and the tutorial 
          return res.view('tutorials-detail-video-edit', {
            me: {
              username: user.username,
              gravatarURL: user.gravatarURL,
              admin: user.admin
            },
            tutorial: {
              title: tutorial.title,
              description: tutorial.description,
              owner: tutorial.owner,
              stars: tutorial.stars,
              video: updatedVideo
            }
          });
        });
      });
    });
  }
};