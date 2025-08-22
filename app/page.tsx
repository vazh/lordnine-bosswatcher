"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Item = {
  id: number;
  name: string;
  updated_at: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
    } else {
      fetchItems();
      setLoading(false);
    }
  }

  async function fetchItems() {
    const { data, error } = await supabase.from("items").select("*").order("id");
    if (!error) setItems(data as Item[]);
  }

  async function addItem() {
    if (!newItem) return;
    await supabase.from("items").insert([{ name: newItem }]);
    setNewItem("");
    fetchItems();
  }

  async function deleteItem(id: number) {
    await supabase.from("items").delete().eq("id", id);
    fetchItems();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📋 My Items</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Add new item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between border-b py-2 items-center"
          >
            <span>{item.name}</span>
            <button
              className="text-red-500"
              onClick={() => deleteItem(item.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
