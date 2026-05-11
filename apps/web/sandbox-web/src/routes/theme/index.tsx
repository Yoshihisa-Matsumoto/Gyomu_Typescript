import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export const Route = createFileRoute('/theme/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>

      <Field>
        <FieldLabel>Normal</FieldLabel>
        <Input placeholder="Normal" />
      </Field>
      <Field>
        <FieldLabel>Disabled</FieldLabel>
        <Input placeholder="Disabled" disabled />
      </Field>
      <Field>
        <FieldLabel>Invalid</FieldLabel>
        <Input aria-invalid />
      </Field>
      <Field data-invalid>
        <FieldLabel>Data Invalid</FieldLabel>
        <Input />
      </Field>
      <Field>
        <FieldLabel>Long Text</FieldLabel>
        <Input value="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
      </Field>
      <Field>
        <FieldLabel>Field Error</FieldLabel>
        <Input placeholder="Normal" />
        <FieldError errors={[{ message: 'Required' }, { message: 'Must be a valid email' }]} />
      </Field>
      <Field>
        <FieldLabel>TextArea</FieldLabel>
        <Textarea placeholder="Normal" />
      </Field>
      <Field data-invalid>
        <FieldLabel>TextArea Data Error</FieldLabel>
        <Textarea placeholder="Normal" value="Lorem Ipsum is simply dummy text of the printing" />
      </Field>
      <Field>
        <FieldLabel>TextArea</FieldLabel>
        <Textarea
          placeholder="Value"
          value="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        />
      </Field>
      <Field>
        <FieldLabel>With Select</FieldLabel>
        <Select>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Genders</SelectLabel>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="error@">Fake Error</SelectItem>
              <SelectItem value="other">Very Long Gender Option</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Disabled Select</FieldLabel>
        <Select>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Genders</SelectLabel>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="error@">Fake Error</SelectItem>
              <SelectItem value="other">Very Long Gender Option</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field data-invalid>
        <FieldLabel>Invalid Select</FieldLabel>
        <Select>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Genders</SelectLabel>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="error@">Fake Error</SelectItem>
              <SelectItem value="other">Very Long Gender Option</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal">
        <FieldLabel>Checkbox</FieldLabel>
        <Checkbox />
        <FieldContent>
          <FieldLabel>Accept terms and conditions</FieldLabel>
          <FieldDescription>By clicking this checkbox, you agree to the terms.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <FieldLabel>Disabled Checkbox</FieldLabel>
        <Checkbox disabled />
        <FieldContent>
          <FieldLabel>Accept terms and conditions</FieldLabel>
          <FieldDescription>By clicking this checkbox, you agree to the terms.</FieldDescription>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel>Field Error</FieldLabel>
        <Checkbox />
        <FieldError errors={[{ message: 'Required' }, { message: 'Must be a valid check' }]} />
      </Field>
    </div>
  )
}
