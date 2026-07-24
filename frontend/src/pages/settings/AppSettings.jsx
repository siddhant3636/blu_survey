import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";

const AppSettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await masterService.getPhotoCategories();
        setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>System Configuration Settings</h2>
      <Card>
        <h4>Photo Categories Catalog</h4>
        <ul style={{ paddingLeft: "20px", marginTop: "10px", fontSize: "14px" }}>
          {categories.map((c) => (
            <li key={c.id} style={{ marginBottom: "6px" }}>
              <strong>{c.name}</strong> - {c.description || "No description"}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default AppSettings;
