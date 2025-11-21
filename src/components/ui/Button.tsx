import { Notification03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Href, useRouter } from "expo-router";
import { NavigationOptions } from "expo-router/build/global-state/routing";
import { CustomPressableProps, PressableScale } from "pressto";
import { ReactNode } from "react";
import { Text } from "react-native";
import { tv } from "tailwind-variants";
import { withUniwind } from "uniwind";
import { cn } from "../../../src/utils/utils";

export type IconSvgObject = typeof Notification03Icon;

export const buttonVariants = tv({
  slots: {
    container:
      "flex-row items-center justify-center rounded-md disabled:opacity-50",
    label: "text-sm font-medium",
    icon: "size-4 shrink-0",
  },
  variants: {
    variant: {
      default: {
        container: "bg-primary shadow-sm active:opacity-90",
        label: "text-primary-foreground",
        icon: "text-primary-foreground",
      },
      destructive: {
        container: "bg-destructive shadow-sm active:opacity-90",
        label: "text-destructive-foreground", // Assuming you have this, or use text-white
        icon: "text-destructive-foreground",
      },
      outline: {
        container:
          "border-4 border-primary bg-background shadow-md active:bg-accent",
        label: "text-primary active:text-accent-foreground",
        icon: "text-primary active:text-accent-foreground",
      },
      secondary: {
        container: "bg-secondary shadow-sm active:opacity-80",
        label: "text-secondary-foreground",
        icon: "text-secondary-foreground",
      },
      ghost: {
        container: "bg-background/10 active:bg-accent",
        label: "text-primary active:text-accent-foreground",
        icon: "text-primary active:text-accent-foreground",
      },
      link: {
        container: "",
        label: "text-primary underline active:opacity-80",
        icon: "text-primary",
      },
    },
    size: {
      default: {
        container: "h-10 px-4 py-2",
        label: "text-sm",
      },
      sm: {
        container: "h-8 px-3 rounded-md gap-1.5",
        label: "text-xs",
      },
      lg: {
        container: "h-12 px-8 rounded-md",
        label: "text-base",
      },
      icon: {
        container: "h-12 w-12",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export const StyledHugeiconsIcon = withUniwind(HugeiconsIcon, {
  color: {
    fromClassName: "colorClassName",
    styleProperty: "color",
  },
  size: {
    fromClassName: "sizeClassName",
    styleProperty: "width", // size applies to both width and height
  },
});

export const StyledPressableScale = withUniwind(PressableScale);

export interface ButtonProps extends CustomPressableProps {
  children?: ReactNode;
  label?: string;
  variant?:
  | "default"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "link";
  size?: "sm" | "default" | "lg" | "icon";
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  icon?: IconSvgObject;
  route?: { href: Href; options?: NavigationOptions };
}

export function Button({
  children,
  label,
  onPress,
  icon,
  style,
  variant = "default",
  size = "default",
  route,
  textClassName,
  className,
  ...props
}: ButtonProps) {
  const router = useRouter();

  const variantSlots = buttonVariants({ variant, size });
  // const activeClassName = "";
  const iconWithLabelClassName = icon && (label || children) ? "mr-2" : "";
  return (
    <StyledPressableScale
      className={cn(variantSlots.container(), className)}
      style={[style, variant === "outline" ? { borderWidth: 1 } : {}]}
      {...props}
      onPress={() => {
        if (onPress) onPress();
        if (route) router.push(route.href, route.options);
      }}
    >
      {label ? (
        <Text
          className={cn(
            variantSlots.label(),
            iconWithLabelClassName,
            textClassName,
          )}
        >
          {label}
        </Text>
      ) : (
        <Text
          className={cn(
            variantSlots.label(),
            iconWithLabelClassName,
            textClassName,
          )}
        >
          {children}
        </Text>
      )}
      {icon && (
        <StyledHugeiconsIcon
          colorClassName={cn(variantSlots.icon())}
          icon={icon}
          sizeClassName="size-5"
        />
      )}
    </StyledPressableScale>
  );
}
