import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import { ActionForm, Field, Page, text, slugify } from '../components/Forms';
import { ErrorState, LoadingState } from '../components/State';
export function ManagementPage() {
  const client = useQueryClient();
  const applications = useQuery({ queryKey: ['applications'], queryFn: () => adminApi.instructors().then(r => r.data.data) });
  const categories = useQuery({ queryKey: ['admin-categories'], queryFn: () => adminApi.categories().then(r => r.data.data) });
  const refresh = () => { void client.invalidateQueries({ queryKey: ['applications'] }); void client.invalidateQueries({ queryKey: ['admin-categories'] }); void client.invalidateQueries({ queryKey: ['categories'] }); };
  if (applications.isLoading || categories.isLoading) return <LoadingState />;
  if (applications.isError || categories.isError) return <ErrorState />;
  return <Page title="Platform management"><Link to="/dashboard">? Course approvals</Link><h2 className="text-3xl">Instructor applications</h2>{applications.data?.length === 0 && <p>No applications yet.</p>}{applications.data?.map(item => <ActionForm key={item.id} onDone={refresh} label="Update approval" submit={data => adminApi.reviewInstructor(item.id, text(data,'approvalStatus'))}><p>{item.user.firstName} {item.user.lastName} ? {item.user.email}</p><p>Current status: {item.approvalStatus}</p><label>Decision <select name="approvalStatus" defaultValue={item.approvalStatus === 'rejected' ? 'rejected' : 'approved'}><option value="approved">Approve</option><option value="rejected">Reject</option></select></label></ActionForm>)}<h2 className="text-3xl">Categories</h2>{categories.data?.map(category => <ActionForm key={category.id} onDone={refresh} submit={data => adminApi.updateCategory(category.id, { name: text(data,'name'), slug: text(data,'slug'), description: text(data,'description'), isActive: data.get('isActive') === 'on' })}><Field name="name" label="Category name" value={category.name} /><Field name="slug" label="Slug" value={category.slug} /><Field name="description" label="Description" value={category.description ?? ''} required={false} /><label><input type="checkbox" name="isActive" defaultChecked={category.isActive} /> Active</label></ActionForm>)}<ActionForm label="Create category" onDone={refresh} submit={data => adminApi.createCategory({ name: text(data,'name'), slug: slugify(text(data,'name')), description: text(data,'description') })}><Field name="name" label="New category name" /><Field name="description" label="Description" required={false} /></ActionForm></Page>;
}
