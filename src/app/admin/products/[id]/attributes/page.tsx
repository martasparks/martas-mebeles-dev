"use client";
import React, { use, useEffect, useState } from "react";

type Attribute = {
  id: string;
  attributeType: { id: string; name: string };
  attributeValue?: { id: string; value: string };
  customValue?: string;
};

export default function ProductAttributesAdmin({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: productId } = use(params);
  
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [typeName, setTypeName] = useState("");
  const [valueName, setValueName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editValueName, setEditValueName] = useState("");

  // Ielādējam esošos atribūtus
  const loadAttributes = async () => {
    const res = await fetch(`/api/products/${productId}/attributes`);
    const data = await res.json();
    setAttributes(data);
  };

  useEffect(() => {
    loadAttributes();
  }, [productId]);

  // Pievienot jaunu atribūtu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/products/${productId}/attributes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typeName, valueName }),
    });

    if (res.ok) {
      setTypeName("");
      setValueName("");
      await loadAttributes();
    } else {
      alert("Kļūda pievienojot atribūtu");
    }
  };

  // Sākt rediģēšanu
  const startEdit = (attr: Attribute) => {
    setEditingId(attr.id);
    setEditTypeName(attr.attributeType.name);
    setEditValueName(attr.attributeValue?.value || attr.customValue || "");
  };

  // Atcelt rediģēšanu
  const cancelEdit = () => {
    setEditingId(null);
    setEditTypeName("");
    setEditValueName("");
  };

  // Saglabāt izmaiņas
  const handleUpdate = async (attributeId: string) => {
    const res = await fetch(`/api/products/${productId}/attributes/${attributeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        typeName: editTypeName, 
        valueName: editValueName 
      }),
    });

    if (res.ok) {
      setEditingId(null);
      setEditTypeName("");
      setEditValueName("");
      await loadAttributes();
    } else {
      alert("Kļūda atjauninot atribūtu");
    }
  };

  // Dzēst atribūtu
  const handleDelete = async (attributeId: string) => {
    if (confirm("Vai tiešām vēlaties dzēst šo atribūtu?")) {
      const res = await fetch(`/api/products/${productId}/attributes/${attributeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadAttributes();
      } else {
        alert("Kļūda dzēšot atribūtu");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Produkta atribūti</h1>

      {/* Esošie atribūti */}
      {attributes.length === 0 ? (
        <p className="text-gray-500">Šim produktam vēl nav atribūtu.</p>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Atribūts</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Vērtība</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Darbības</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr) => (
                <tr key={attr.id} className="border-b hover:bg-gray-50">
                  {editingId === attr.id ? (
                    <>
                      {/* Rediģēšanas režīms */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editTypeName}
                          onChange={(e) => setEditTypeName(e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editValueName}
                          onChange={(e) => setEditValueName(e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleUpdate(attr.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Saglabāt
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500"
                          >
                            Atcelt
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Parādīšanas režīms */}
                      <td className="px-4 py-3 font-medium text-gray-600">
                        {attr.attributeType.name}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {attr.attributeValue?.value || attr.customValue}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(attr)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Labot
                          </button>
                          <button
                            onClick={() => handleDelete(attr.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Dzēst
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Forma jauna atribūta pievienošanai */}
      <div className="border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">Pievienot jaunu atribūtu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Atribūta nosaukums</label>
              <input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="piem., Krāsa, Materiāls, Izmērs"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Atribūta vērtība</label>
              <input
                type="text"
                value={valueName}
                onChange={(e) => setValueName(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="piem., Sarkana, Koks, Liels"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Pievienot atribūtu
          </button>
        </form>
      </div>
    </div>
  );
}
