import React, { useState, useCallback, useEffect } from "react";
import {
  GiftedChat,
  IMessage,
  Bubble,
  Send,
  InputToolbar,
  Composer,
} from "react-native-gifted-chat";
import { db, auth } from "@/library/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import {
  Image,
  View,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ChatParams {
  travelId: string;
  userId: string;
  creatorId: string;
}

const Chat: React.FC = () => {
  const params = useLocalSearchParams();
  const { travelId } = params as unknown as ChatParams;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [profilePictures, setProfilePictures] = useState<{
    [key: string]: string;
  }>({});

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!travelId) return;

    const messagesRef = collection(db, "travels", travelId, "chats");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesFirestore = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const firebaseData = doc.data();
          const userProfile = await getProfilePicture(firebaseData.user._id);

          const data: IMessage = {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: new Date(firebaseData.createdAt.seconds * 1000),
            user: {
              ...firebaseData.user,
              avatar: userProfile,
            },
          };

          return data;
        })
      );

      setMessages(messagesFirestore);
    });

    return () => unsubscribe();
  }, [travelId]);

  const getProfilePicture = async (userId: string) => {
    if (profilePictures[userId]) return profilePictures[userId];
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    const profilePicture = userData?.profilePicture || "";
    setProfilePictures((prev) => ({ ...prev, [userId]: profilePicture }));
    return profilePicture;
  };

  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      const { _id, createdAt, text, user } = messages[0];

      try {
        await addDoc(collection(db, "travels", travelId, "chats"), {
          _id,
          createdAt,
          text,
          user,
        });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    },
    [travelId]
  );
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: "#1A1A1A",
            fontFamily: "CerebriSans-Book",
            fontSize: 15,
          },
          left: {
            color: "#1A1A1A",
            fontFamily: "CerebriSans-Book",
            fontSize: 15,
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: "#9DD187",
            borderRadius: 20,
            borderTopRightRadius: 4,
            padding: 5,
            marginVertical: 3,
            marginRight: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          },
          left: {
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            borderTopLeftRadius: 4,
            padding: 5,
            marginVertical: 3,
            marginLeft: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          },
        }}
        timeTextStyle={{
          right: {
            color: "rgba(0,0,0,0.5)",
            fontSize: 12,
          },
          left: {
            color: "rgba(0,0,0,0.5)",
            fontSize: 12,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbarContainer}
        primaryStyle={styles.inputToolbarPrimary}
        renderActions={() => (
          <View style={styles.actionContainer}>
            <Ionicons name="add-circle-outline" color="#9DD187" size={24} />
          </View>
        )}
        renderSend={(sendProps) => (
          <Send {...sendProps} containerStyle={styles.sendContainer}>
            <View style={styles.sendButton}>
              <Ionicons name="send" color="#FFFFFF" size={20} />
            </View>
          </Send>
        )}
      />
    );
  };

  const renderAvatar = (props: any) => {
    const { currentMessage } = props;
    return (
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: currentMessage.user.avatar }}
          style={styles.avatar}
        />
      </View>
    );
  };

  const renderComposer = (props: any) => {
    return (
      <Composer
        {...props}
        textInputStyle={styles.composer}
        placeholderTextColor="#999"
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backgroundContainer}>
            <GiftedChat
              messages={messages}
              onSend={(messages) => onSend(messages)}
              user={{
                _id: auth.currentUser?.uid || "",
                name: auth.currentUser?.displayName || "User",
              }}
              renderBubble={renderBubble}
              renderAvatar={renderAvatar}
              renderInputToolbar={renderInputToolbar}
              renderComposer={renderComposer}
              maxComposerHeight={100}
              minComposerHeight={50}
              keyboardShouldPersistTaps="handled"
              inverted={true}
              listViewProps={{
                style: styles.chatList,
                contentContainerStyle: styles.chatContentContainer,
                keyboardDismissMode: "on-drag",
                keyboardShouldPersistTaps: "handled",
              }}
              renderChatFooter={() => <View style={styles.footer} />}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  chatList: {
    backgroundColor: 'transparent',
  },
  chatContentContainer: {
    paddingVertical: 16,
  },
  inputToolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    } : {
      elevation: 4,
    }),
  },
  inputToolbarPrimary: {
    alignItems: 'center',
  },
  actionContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  composer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    minHeight: 40,
  },
  sendContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  sendButton: {
    backgroundColor: '#9DD187',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  footer: {
    height: 8
  },
});

export default Chat;