import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Label } from '@/shared/ui/label';
import { EmojiPicker } from '@/shared/ui/emoji-picker';
import { SegmentControl } from '@/shared/ui/segment-control';
import { getErrorMessage } from '@/shared/types/app-error';
import { FormError } from '@/modules/auth/components/FormError';
import { createCategorySchema, type CreateCategoryInput } from '../schemas/category.schema';
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategoryMutations';
import { CATEGORY_EMOJIS } from '../constants/category.constants';
import type { Category, CategoryType } from '../types/category.types';
import { useConfirm } from '@/shared/hooks/useConfirm';

interface CategoryFormSheetProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  defaultType: CategoryType;
  category?: Category;
}

/** Formulario de categoría (Cap. 6.9): emoji, nombre, tipo. Crear/editar/eliminar. */
export function CategoryFormSheet({
  open,
  onClose,
  workspaceId,
  defaultType,
  category,
}: CategoryFormSheetProps) {
  const isEdit = !!category;
  const create = useCreateCategory(workspaceId);
  const update = useUpdateCategory(workspaceId);
  const confirm = useConfirm();
  const remove = useDeleteCategory(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: category
      ? { name: category.name, emoji: category.emoji, type: category.type }
      : { name: '', emoji: '🏷️', type: defaultType },
  });

  const onSubmit = handleSubmit((data) => {
    if (isEdit && category) {
      update.mutate({ id: category.id, input: data }, { onSuccess: onClose });
    } else {
      create.mutate(data, { onSuccess: onClose });
    }
  });

  const error = create.error ?? update.error;
  const isPending = create.isPending || update.isPending;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar categoría' : 'Nueva categoría'}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error ? <FormError message={getErrorMessage(error)} /> : null}

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SegmentControl
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'expense', label: 'Gasto' },
                { value: 'income', label: 'Ingreso' },
              ]}
            />
          )}
        />

        <div className="flex flex-col gap-2">
          <Label>Emoji</Label>
          <Controller
            control={control}
            name="emoji"
            render={({ field }) => (
              <EmojiPicker value={field.value} onChange={field.onChange} emojis={CATEGORY_EMOJIS} />
            )}
          />
        </div>

        <TextField
          label="Nombre"
          placeholder="Comida"
          error={errors.name?.message}
          {...register('name')}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </form>

      {isEdit && category ? (
        <Button
          variant="danger"
          className="mt-3 w-full"
          onClick={async () => {
            const ok = await confirm({
              title: '¿Eliminar esta categoría?',
              description: 'Los movimientos existentes conservarán su historial.',
              emoji: '🏷️',
            });
            if (ok) remove.mutate(category.id, { onSuccess: onClose });
          }}
        >
          Eliminar
        </Button>
      ) : null}
    </BottomSheet>
  );
}
