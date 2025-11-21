import { Text, TextProps } from "react-native";

export interface ParagraphProps extends TextProps {
  muted?: boolean;
}

export function Paragraph({
  className,
  muted = false,
  ...props
}: ParagraphProps) {
  return <Text className="text-" {...props} />;
}

export interface HeadingProps extends TextProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  muted?: boolean;
}

export function Heading({
  className,
  level = 1,
  muted = false,
  ...props
}: HeadingProps) {
  return <Text {...props} />;
}
