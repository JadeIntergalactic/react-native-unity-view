import * as React from 'react';
import { requireNativeComponent, View, ViewProps } from 'react-native';
import MessageHandler from './MessageHandler';
import { UnityModule } from './UnityModule';
import { Component } from 'react';

export interface UnityViewProps extends ViewProps {
  /**
   * Receive string message from unity.
   */
  onMessage?: (message: string) => void;
  /**
   * Receive unity message from unity.
   */
  onUnityMessage?: (handler: MessageHandler) => void;

  children?: React.ReactNode;

  /**
   * Calls Application.Unload() when the view is unmounted.
   */
  unloadOnUnmount?: boolean;
}

let NativeUnityView;

class UnityView extends Component<UnityViewProps> {
  state = {
    handle: null,
  };

  componentDidMount(): void {
    const { onUnityMessage, onMessage, unloadOnUnmount } = this.props;
    console.log('Mounting the thing');

    this.setState({
      handle: UnityModule.addMessageListener(message => {
        if (onUnityMessage && message instanceof MessageHandler) {
          onUnityMessage(message);
        }
        if (onMessage && typeof message === 'string') {
          onMessage(message);
        }
      }),
    });
    if (unloadOnUnmount) {
      UnityModule.reloadAfterUnload();
    }
  }

  componentWillUnmount(): void {
    console.log('Unmounting The thing');
    const { unloadOnUnmount } = this.props;

    UnityModule.removeMessageListener(this.state.handle);

    if (unloadOnUnmount) {
      UnityModule.unload();
    }
  }

  render() {
    const { props } = this;
    return (
      <View {...props}>
        <NativeUnityView
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          onUnityMessage={props.onUnityMessage}
          onMessage={props.onMessage}
        />
        {props.children}
      </View>
    );
  }
}

NativeUnityView = requireNativeComponent('RNUnityView', UnityView);

export default UnityView;
