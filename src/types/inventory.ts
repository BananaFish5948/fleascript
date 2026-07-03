export type InventoryStatus = 'hand' | 'mercari' | 'yahoo' | 'sold';

export interface InventoryItem {
  id: string;
  user_id: string;
  item_name: string;
  purchase_price: number;
  target_price: number;
  postage: number;
  fee_rate: number;
  box_number: string | null;
  status: InventoryStatus;
  description_stock: string | null;
  created_at: string;
  updated_at: string;
}
