<script lang="ts">
  import RxButton from '$lib/components/RxButton.svelte'
  import RxCard from '$lib/components/RxCard.svelte'
  import RxForm from '$lib/components/RxForm.svelte'
  import RxFormItem from '$lib/components/RxFormItem.svelte'
  import RxInput from '$lib/components/RxInput.svelte'
  import { platform } from '$lib/stores/platform'
  import { _ } from 'svelte-i18n'
  import { z } from 'zod'
  import { validator } from '@felte/validator-zod'
  import { createForm } from 'felte'

  let schema = z.object({
    account: z
      .string()
      .trim()
      .min(2, { message: $_('account.accountTooShort') })
      .max(32, { message: $_('account.accountTooLong') }),
    password: z
      .string()
      .trim()
      .min(8, { message: $_('account.passwordTooShort') })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,40}$/, { message: $_('account.passwordTooWeak') }),
    captchaId: z.string().trim(),
    captchaAnswer: z
      .string()
      .trim()
      .min(1, { message: $_('account.captchaIsRequired') }),
  })

  const { form, errors } = createForm({
    extend: validator({ schema }),
  })
</script>

<svelte:head><title>{$_('account.login')} - {$platform.name}</title></svelte:head>

<div class="flex-1 flex flex-col md:justify-center items-center p-3 lg:p-6">
  <RxCard class="flex flex-col md:flex-row w-full max-w-4xl">
    <div class="md:w-0 flex-1 flex-col">
      <h1 class="text-center font-bold text-base">{$_('account.login')}</h1>
      <RxForm {form}>
        <RxFormItem
          name="account"
          label={$_('account.account')}
          hasError={$errors.account !== null}
          errors={$errors.account || ''}
        >
          <RxInput
            icon="icon-[fluent--person-16-regular]"
            class="w-full"
            id="account"
            name="account"
            hasError={$errors.account !== null}
          />
        </RxFormItem>
        <RxFormItem
          name="password"
          label={$_('account.password')}
          hasError={$errors.password !== null}
          errors={$errors.password || ''}
        >
          <RxInput
            icon="icon-[fluent--lock-16-regular]"
            class="w-full"
            id="password"
            type="password"
            name="password"
            hasError={$errors.password !== null}
          />
        </RxFormItem>
        <RxFormItem name="submit" label="">
          <RxButton class="w-full" level="primary">{$_('account.login')}</RxButton>
        </RxFormItem>
      </RxForm>
    </div>
    <div class="divider md:divider-horizontal opacity-60">{$_('misc.or')}</div>
    <div class="md:w-0 flex-1" />
  </RxCard>
</div>
