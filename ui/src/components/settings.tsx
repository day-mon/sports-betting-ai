import { useContext } from "solid-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";
import { OcGear3 } from "solid-icons/oc";
import { IThemeContext, ThemeContext, themeOptions } from "~/context/ThemeContext.tsx";
import { DialogModal } from "~/components/dialog-modal.tsx";

export function Settings() {
  const themeContext: IThemeContext = useContext(ThemeContext);

  return (
    <DialogModal title="Settings" trigger={<OcGear3 class="w-6 h-6" />}>
      <label class="block text-sm font-medium mb-2 text-100 light:text-black">Theme</label>
      <Select
        value={themeContext.theme}
        onChange={themeContext.setTheme}
        options={themeOptions}
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
    </DialogModal>
  );
}
