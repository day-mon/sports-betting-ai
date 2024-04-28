import { ComponentProps, useContext } from "solid-js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";
import { OcGear3 } from "solid-icons/oc";
import { IThemeContext, ThemeContext } from "~/context/ThemeContext.tsx";

export function Settings() {
  const availableThemes = ["blackout", "logan", "lavender", "light", "blue"];
  const themeContext: IThemeContext = useContext(ThemeContext);

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <OcGear3 class="w-6 h-6" />
      </AlertDialogTrigger>
      <AlertDialogContent
        class={`bg-primary dark:bg-blackout text-100 dark:text-white ${themeContext.theme}`}
      >
        <AlertDialogTitle class="font-bold text-100 light:text-black underline underline-offset-2">
          Settings
        </AlertDialogTitle>
        <AlertDialogDescription>
          <label class="block text-sm font-medium mb-2 text-100 light:text-black">Theme</label>
          <Select
            value={themeContext.theme}
            onChange={themeContext.setTheme}
            options={availableThemes}
            placeholder="Select a theme"
            itemComponent={props => (
              <SelectItem item={props.item} class="focus:bg-400 focus:font-bold light:focus:bg-800">
                {props.item.rawValue}
              </SelectItem>
            )}
            class="text-100 light:text-black"
          >
            <SelectTrigger aria-label="Theme" class="w-[180px] bg-secondary">
              <SelectValue<string>>{state => state.selectedOption()}</SelectValue>
            </SelectTrigger>
            <SelectContent class={`bg-secondary text-100 light:text-black ${themeContext.theme}`} />
          </Select>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
