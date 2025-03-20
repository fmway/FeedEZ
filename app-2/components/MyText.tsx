import { Text, TextProps } from "react-native";

export function MyText({ style, children, ...res }: TextProps) {
    return (
        <Text style={[{
          fontFamily: "Poppins"
        }, style]} {...res}>
            { children }
        </Text>
    );
}