const { JitsiMeetExternalAPI } = window;

export default {
  name: 'Jitsi',

  props: {
    room: String,
    email: String,    
    name: String,
    password: String,
  },
  
  data() {
    return {
    };
  },

  render() {
  },
  
  mounted() {
    const domain = 'meet.jit.si';
    const options = {
      roomName: this.$props.room,
      password: 'testing',
      width: '100%',
      height: '100%',
      parentNode: this.$el.parentNode,
      userInfo: {
        email: this.$props.email,
        displayName: this.$props.name,
      },
      interfaceConfigOverwrite: {
        APP_NAME: 'Circle Z',
        NATIVE_APP_NAME: 'Circle Z',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions',
          // 'desktop', -- requires some electron thing?
          'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'info', 'recording',
          'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          'e2ee',
        ],
      },
      
    };
    const api = new JitsiMeetExternalAPI(domain, options);

    // when local user is trying to enter in a locked room 
    api.addEventListener('passwordRequired', () => {
      api.executeCommand('password', this.$props.password);
    });
    
    // when local user has joined the video conference 
    api.addEventListener('videoConferenceJoined', () => {
      api.executeCommand('password', this.$props.password);
    });
    
    api.addEventListener('readyToClose', () => {
      this.$emit('hangup');
      api.dispose();
    });
  },
  
};
