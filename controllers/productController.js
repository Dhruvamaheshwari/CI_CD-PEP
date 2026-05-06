const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    // check id aai h ki nhi
    if (!id) {
      return res.status(402).json({ succ: false, mess: "Missing ID Field" });
    }

    // check that id is present in the database or not
    const isIdPresent = await product.findById(id);
    if (!isIdPresent) {
      return res.status(402).json({ succ: false, mess: "this Id is not found" });
    }

    // get all the problem
    const allProduct = await product.findById(id);
    return res.status(200).json({succ:true , mess:allProduct});

  } catch (error) {
    return res.status(500).json({ succ: false, mess: error.message });
  }
};