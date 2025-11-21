import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { Picker, PickerProps } from "@react-native-picker/picker";
import { Checkbox, CheckboxProps } from "expo-checkbox";
import { useState } from "react";
import { type TextInputProps, Text, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";
import { cn } from "../../../src/utils/utils";
import { Button } from "./Button";

const StyledPicker = withUniwind(Picker) as any;
const StyledPickerItem = withUniwind(Picker.Item);
const StyledCheckbox = withUniwind(Checkbox);

// TODO: merge user className props with default styles

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}
// class={}
export function Input({ label, error, className, ...props }: InputProps) {
  const [focus, setFocus] = useState(false);
  const focusClassName = focus
    ? "border-ring border-ring/50 border-2 shadow-sm"
    : "";
  const invalidClassName = error
    ? "border-destructive/20 dark:border-destructive/40 border-destructive"
    : "";
  return (
    <View className="w-full gap-1.5">
      {label && (
        <Text className="text-foreground mb-2 text-sm font-medium">
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColorClassName="accent-muted-foreground"
        selectionColorClassName="accent-primary-foreground"
        cursorColorClassName="accent-primary"
        className={cn(
          "border-input bg-background dark:bg-input/30 shadow-xs flex flex-row h-12 w-full min-w-0 rounded-md border px-3 py-1.5 text-base text-foreground  disabled:opacity-50 md:text-sm ",
          focusClassName,
          invalidClassName,
          className,
        )}
        onBlur={(e) => {
          setFocus(false);
          if (props.onBlur) props.onBlur(e);
        }}
        onFocus={(e) => {
          setFocus(true);
          if (props.onFocus) props.onFocus(e);
        }}
        {...props}
      />
      {error && (
        <Text className="mt-2 text-sm text-destructive font-medium">
          {error}
        </Text>
      )}
    </View>
  );
}

// PasswordInput uses same props as Input but controls secureTextEntry internally
export type PasswordInputProps = Omit<InputProps, "secureTextEntry">;

export function PasswordInput({
  label,
  error,
  style,
  className,
  ...props
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  const [focus, setFocus] = useState(false);
  const focusClassName = focus
    ? "border-ring border-ring/50 border-2 shadow-sm"
    : "";
  const invalidClassName = error
    ? "border-destructive/20 dark:border-destructive/40 border-destructive"
    : "";

  return (
    <View className="w-full gap-0.5">
      {label && (
        <Text className="mb-2 text-sm text-foreground font-medium">
          {label}
        </Text>
      )}
      <View className="w-full relative flex-row items-center">
        <TextInput
          secureTextEntry={!isPasswordVisible}
          placeholderTextColorClassName="accent-muted-foreground"
          selectionColorClassName="accent-primary"
          cursorColorClassName="accent-primary"
          className={cn(
            "border-input bg-background dark:bg-input/30 shadow-xs flex flex-row h-12 w-full min-w-0 rounded-md border px-3 py-1.5 text-base text-foreground  disabled:opacity-50 md:text-sm pr-10",
            focusClassName,
            invalidClassName,
            className,
          )}
          onBlur={(e) => {
            setFocus(false);
            if (props.onBlur) props.onBlur(e);
          }}
          onFocus={(e) => {
            setFocus(true);
            if (props.onFocus) props.onFocus(e);
          }}
          {...props}
        />
        <Button
          onPress={togglePasswordVisibility}
          size="icon"
          icon={isPasswordVisible ? ViewIcon : ViewOffIcon}
          variant="ghost"
          className="absolute right-0.5 z-10 justify-center items-center"
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        />
      </View>
      {error && (
        <Text className="mt-2 text-sm font-medium text-destructive">
          {error}
        </Text>
      )}
    </View>
  );
}

export type SelectProps = {
  items: { label: string; value: string }[];
} & PickerProps<string>;
export function Select({ items, ...props }: SelectProps) {
  return (
    <StyledPicker<string>
      dropdownIconColorClassName="accent-foreground"
      selectionColorClassName="accent-primary"
      className="w-3/4 h-14 justify-center items-center rounded-md text-foreground bg-input border-2  px-8"
      mode="dropdown"
      {...props}
    >
      {items.map((item, idx) => (
        <StyledPickerItem
          className="text-md text-foreground bg-input"
          key={item.value + item.label + idx}
          label={item.label}
          value={item.value}
        />
      ))}
    </StyledPicker>
  );
}

export interface CheckboxInputProps extends CheckboxProps {
  label: string;
  className?: string;
}

export function CheckboxInput({
  label,
  className,
  ...props
}: CheckboxInputProps) {
  const [isChecked, setChecked] = useState(false);

  return (
    <View className="flex flex-row">
      <StyledCheckbox
        onValueChange={(v) => {
          setChecked(v);
          if (props.onValueChange) props.onValueChange(v);
        }}
        colorClassName={isChecked ? "accent-primary" : "accent-input"}
        value={isChecked}
        className="dark:shadow-primary/40 amoled:shadow-primary/30  shadow-sm size-5 rounded-sm border-2 border-input bg-background"
        {...props}
      />
      <Text className="ml-4 text-foreground font-medium">{label}</Text>
    </View>
  );
}
