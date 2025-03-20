import { Text, TextInput, TextInputProps } from "react-native";

export function MyTextInput({ style, ...res }: TextInputProps) {
    return (
        <TextInput style={[style, {
          fontFamily: "Poppins"
        }]} {...res} />
    );
}