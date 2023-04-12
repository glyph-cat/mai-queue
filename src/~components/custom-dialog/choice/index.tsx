import { useCallback } from 'react'
import { TextButton, TextButtonProps } from '~components/form'
import { CustomDialogButtonContainer } from '../components'
import { useCustomDialogFreeformContext } from '../freeform'

export interface ChoiceItem<Response> {
  label: TextButtonProps['label']
  color?: TextButtonProps['color']
  type?: TextButtonProps['type']
  value?: Response
}

export interface CustomDialogChoiceComponentProps<Response> {
  data: Array<ChoiceItem<Response>>
}

export function CustomDialogChoiceComponent<Response>({
  data,
}: CustomDialogChoiceComponentProps<Response>): JSX.Element {

  const { cancel, submit } = useCustomDialogFreeformContext<Response>()

  const onCancel = useCallback(() => {
    cancel()
  }, [cancel])

  const factorySubmitValue = useCallback((value: Response) => {
    return () => { submit(value) }
  }, [submit])

  const renderStack = []
  for (let i = 0; i < data.length; i++) {
    const { label, color, value, type } = data[i]
    renderStack.push(
      <TextButton
        key={i}
        label={label}
        type={type}
        onPress={value ? factorySubmitValue(value) : onCancel}
        {...(!type && !color ? { type: 'neutral' } : {})}
      />
    )
  }

  return (
    <CustomDialogButtonContainer>
      {renderStack}
    </CustomDialogButtonContainer>
  )
}
